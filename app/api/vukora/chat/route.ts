import { auth } from "@clerk/nextjs/server";
import { generateText, stepCountIs, tool } from "ai";
import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { z } from "zod";
import { api } from "@/convex/_generated/api";
import { getServerAuthContext } from "@/lib/server-auth";
import type {
  InteractiveQuizPayload,
  PageLearningContext,
  QuizQuestion,
} from "@/lib/types";

const requestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(8000),
      }),
    )
    .min(1)
    .max(40),
  pageContext: z
    .object({
      pathname: z.string(),
      pageTitle: z.string(),
      pageType: z.enum([
        "home",
        "courses",
        "course",
        "lesson",
        "pricing",
        "dashboard",
        "admin",
        "other",
      ]),
      courseSlug: z.string().optional(),
      courseTitle: z.string().optional(),
      courseTier: z.enum(["free", "pro"]).optional(),
      moduleTitle: z.string().optional(),
      lessonSlug: z.string().optional(),
      lessonTitle: z.string().optional(),
      lessonSummary: z.string().optional(),
    })
    .optional(),
});

const quizSchema = z.object({
  title: z.string().min(1),
  topic: z.string().min(1),
  questions: z
    .array(
      z.object({
        id: z.string().min(1),
        question: z.string().min(1),
        options: z.array(z.string().min(1)).min(2).max(5),
        correctIndex: z.number().int().min(0),
        explanation: z.string().min(1),
      }),
    )
    .min(1)
    .max(5),
});

interface CatalogLessonSummary {
  id: string;
  slug: string;
  title: string;
  summary: string;
  isFreePreview: boolean;
  durationSeconds: number;
}

interface CatalogModuleSummary {
  id: string;
  title: string;
  order: number;
  lessons: CatalogLessonSummary[];
}

interface CatalogCourseSummary {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  level: string;
  tier: string;
  estimatedHours: number;
  tags: string[];
  modules: CatalogModuleSummary[];
}

interface ActiveLessonData {
  courseSlug: string;
  courseTitle: string;
  lessonSlug: string;
  lessonTitle: string;
  summary: string;
  markdownContent: string;
  quizCount: number;
}

interface CatalogSnapshotData {
  courses: CatalogCourseSummary[];
  activeLesson: ActiveLessonData | null;
}

interface UserProgressData {
  enrolledCourses: Array<{
    slug: string;
    title: string;
    tier: string;
    completedCount: number;
    totalLessons: number;
    completedLessons: Array<{ slug: string; title: string }>;
    nextLesson: { slug: string; title: string } | null;
  }>;
  totalCompletedLessons: number;
}

function hasModelCredentials(): boolean {
  return Boolean(
    process.env.AI_GATEWAY_API_KEY ||
      process.env.VERCEL_OIDC_TOKEN ||
      process.env.ANTHROPIC_API_KEY ||
      process.env.OPENAI_API_KEY,
  );
}

function createConvexClient(token?: string | null): ConvexHttpClient | null {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL ?? process.env.CONVEX_URL;
  if (!url) return null;
  const client = new ConvexHttpClient(url);
  if (token) {
    client.setAuth(token);
  }
  return client;
}

function extractHeadingsAndBullets(markdown: string): {
  headings: string[];
  bullets: string[];
  codeLanguages: string[];
} {
  const headings: string[] = [];
  const bullets: string[] = [];
  const codeLanguages: string[] = [];

  for (const rawLine of markdown.split("\n")) {
    const line = rawLine.trim();
    const headingMatch = line.match(/^#{1,3}\s+(.+)$/);
    if (headingMatch) {
      const cleaned = headingMatch[1].replace(/[`*_]/g, "").trim();
      if (cleaned && !headings.includes(cleaned)) {
        headings.push(cleaned);
      }
      continue;
    }
    const bulletMatch = line.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      const cleaned = bulletMatch[1].replace(/[`*_]/g, "").trim();
      if (cleaned.length > 12 && bullets.length < 8) {
        bullets.push(cleaned);
      }
      continue;
    }
    const fenceMatch = line.match(/^```([\w-]+)/);
    if (fenceMatch && !codeLanguages.includes(fenceMatch[1])) {
      codeLanguages.push(fenceMatch[1]);
    }
  }

  return { headings, bullets, codeLanguages };
}

function buildFallbackQuiz(
  pageContext: PageLearningContext | undefined,
  catalog: CatalogSnapshotData | null,
  activeLesson: ActiveLessonData | null,
): InteractiveQuizPayload {
  const activeCourse =
    catalog?.courses.find((c) => c.slug === pageContext?.courseSlug) ??
    catalog?.courses[0] ??
    null;

  if (activeLesson) {
    const { headings, bullets } = extractHeadingsAndBullets(
      activeLesson.markdownContent,
    );
    const courseLessons =
      activeCourse?.modules.flatMap((m) => m.lessons) ?? [];
    const siblingLessons = courseLessons.filter(
      (l) => l.slug !== activeLesson.lessonSlug,
    );
    const primaryHeading = headings[1] ?? headings[0] ?? activeLesson.lessonTitle;
    const secondaryHeading =
      headings[2] ?? headings[1] ?? "Core implementation patterns";

    const questions: QuizQuestion[] = [
      {
        id: "q-goal",
        question: `What is the primary focus of "${activeLesson.lessonTitle}"?`,
        options: [
          activeLesson.summary,
          siblingLessons[0]?.summary ??
            "Managing static CSS stylesheets without dynamic backend state",
          siblingLessons[1]?.summary ??
            "Configuring DNS email forwarding and SMTP relays",
          "Replacing client-side routing with full-page server reloads only",
        ],
        correctIndex: 0,
        explanation: `This lesson focuses directly on: ${activeLesson.summary}`,
      },
      {
        id: "q-section",
        question: `Which topic is explicitly covered in "${activeLesson.lessonTitle}"?`,
        options: [
          "Legacy FTP deployment scripts",
          primaryHeading,
          "Manual assembly memory allocation",
          "Deprecated jQuery animation queues",
        ],
        correctIndex: 1,
        explanation: `"${primaryHeading}" is one of the core sections walked through in this lesson.`,
      },
      {
        id: "q-practice",
        question: bullets[0]
          ? `Which takeaway aligns with the guidance in "${activeLesson.lessonTitle}"?`
          : `How does "${activeLesson.lessonTitle}" fit into "${activeLesson.courseTitle}"?`,
        options: bullets[0]
          ? [
              "Skip validation and trust raw client input directly",
              "Avoid modular architecture and keep all logic in one file",
              bullets[0],
              "Disable TypeScript strict mode in production builds",
            ]
          : [
              `It teaches ${secondaryHeading} as part of building production apps in ${activeLesson.courseTitle}.`,
              "It is unrelated to the rest of the course curriculum.",
              "It only applies to desktop native C++ applications.",
              "It replaces the need for authentication and authorization.",
            ],
        correctIndex: bullets[0] ? 2 : 0,
        explanation: bullets[0]
          ? `Key lesson takeaway: ${bullets[0]}`
          : `This lesson builds hands-on skills around ${secondaryHeading} inside ${activeLesson.courseTitle}.`,
      },
    ];

    return {
      title: `${activeLesson.lessonTitle} — Quick Check`,
      topic: activeLesson.lessonTitle,
      questions,
    };
  }

  if (activeCourse) {
    const firstModule = activeCourse.modules[0];
    const firstLesson = firstModule?.lessons[0];
    const tags =
      activeCourse.tags.length > 0
        ? activeCourse.tags.slice(0, 3).join(", ")
        : activeCourse.category;

    const questions: QuizQuestion[] = [
      {
        id: "q-course-focus",
        question: `What does "${activeCourse.title}" focus on teaching?`,
        options: [
          activeCourse.subtitle,
          "Basic spreadsheet formulas and pivot tables",
          "Hardware PCB soldering and firmware flashing",
          "3D character rigging for feature animation",
        ],
        correctIndex: 0,
        explanation: `${activeCourse.title}: ${activeCourse.subtitle}`,
      },
      {
        id: "q-course-stack",
        question: `Which core technologies or topics are featured in "${activeCourse.title}"?`,
        options: [
          "COBOL, Fortran, and mainframe batch jobs",
          tags,
          "ActionScript 2 and Adobe Flash",
          "Perl CGI scripts and Apache .htaccess",
        ],
        correctIndex: 1,
        explanation: `This course emphasizes hands-on work with ${tags}.`,
      },
      {
        id: "q-course-start",
        question: firstLesson
          ? `Which lesson introduces the foundations in "${firstModule?.title}"?`
          : `What skill level is "${activeCourse.title}" designed for?`,
        options: firstLesson
          ? [
              firstLesson.title,
              "Deploying Kubernetes bare-metal clusters",
              "Writing custom Linux kernel drivers",
              "Designing analog audio synthesizers",
            ]
          : [
              `${activeCourse.level} (${activeCourse.tier.toUpperCase()} tier)`,
              "Hardware embedded systems only",
              "Unrelated non-technical seminar",
              "Legacy desktop VB6 maintenance",
            ],
        correctIndex: 0,
        explanation: firstLesson
          ? `"${firstLesson.title}" kicks off ${firstModule?.title}: ${firstLesson.summary}`
          : `${activeCourse.title} is structured for ${activeCourse.level} learners.`,
      },
    ];

    return {
      title: `${activeCourse.title} — Concept Check`,
      topic: activeCourse.title,
      questions,
    };
  }

  return {
    title: "Full-Stack Architecture — Concept Check",
    topic: "Next.js, Convex & Auth",
    questions: [
      {
        id: "q-auth-server",
        question:
          "Where should subscription and Pro access checks always be enforced?",
        options: [
          "Only in client-side React state",
          "On the server (API routes and Convex queries/mutations) in addition to UI gating",
          "In CSS class names",
          "Inside browser localStorage flags",
        ],
        correctIndex: 1,
        explanation:
          "Client checks improve UX, while server-side verification in API routes and Convex functions enforces real security.",
      },
      {
        id: "q-convex-reactive",
        question:
          "Why do Convex queries stay automatically up to date in React components?",
        options: [
          "They poll every 100ms via setInterval",
          "They subscribe reactively to database dependencies and push updates when data changes",
          "They require manual page refreshes",
          "They cache responses forever in cookies",
        ],
        correctIndex: 1,
        explanation:
          "Convex tracks query dependencies and streams live updates to subscribed clients whenever underlying documents change.",
      },
      {
        id: "q-ai-tools",
        question:
          "What is the main benefit of giving an AI tutor structured backend tools?",
        options: [
          "It eliminates the need for course content",
          "It grounds answers in live lesson content and real learner progress instead of guessing",
          "It removes authentication requirements",
          "It prevents Markdown rendering",
        ],
        correctIndex: 1,
        explanation:
          "Tool calls let the tutor query live catalog data, lesson markdown, and user progress so answers stay accurate and personalized.",
      },
    ],
  };
}

function buildFallbackResponse(params: {
  lastUserMessage: string;
  pageContext?: PageLearningContext;
  catalog: CatalogSnapshotData | null;
  progress: UserProgressData | null;
}): {
  reply: string;
  quizzes: InteractiveQuizPayload[];
  toolCalls: string[];
} {
  const { lastUserMessage, pageContext, catalog, progress } = params;
  const activeLesson = catalog?.activeLesson ?? null;
  const lower = lastUserMessage.toLowerCase();
  const toolCalls: string[] = [];
  const quizzes: InteractiveQuizPayload[] = [];

  const wantsQuiz =
    /\b(quiz|test me|practice|check my understanding|flashcards?|mcq|questions?)\b/i.test(
      lower,
    );
  const wantsProgress =
    /\b(progress|next|study plan|enrolled|completed|dashboard|what should i learn|where did i leave)\b/i.test(
      lower,
    );
  const wantsCatalog =
    /\b(courses?|catalog|recommend|what can i learn|list|curriculum|modules?)\b/i.test(
      lower,
    );

  if (wantsQuiz) {
    if (activeLesson) toolCalls.push("get_lesson_content");
    else if (catalog) toolCalls.push("list_courses");
    toolCalls.push("create_interactive_quiz");

    const quiz = buildFallbackQuiz(pageContext, catalog, activeLesson);
    quizzes.push(quiz);

    return {
      reply: `Here's an interactive **${quiz.questions.length}-question quiz** on **${quiz.topic}** grounded in your current course material. Pick your answers below and click **Check Answers** for instant feedback and explanations!`,
      quizzes,
      toolCalls,
    };
  }

  if (wantsProgress) {
    toolCalls.push("get_user_progress");
    if (catalog) toolCalls.push("list_courses");

    if (progress && progress.enrolledCourses.length > 0) {
      const lines = progress.enrolledCourses.map((course) => {
        const pct =
          course.totalLessons > 0
            ? Math.round((course.completedCount / course.totalLessons) * 100)
            : 0;
        const nextText = course.nextLesson
          ? `Next up: **${course.nextLesson.title}**`
          : "All lessons completed!";
        return `- **${course.title}** (${course.completedCount}/${course.totalLessons} lessons, ${pct}%) — ${nextText}`;
      });

      const firstNext = progress.enrolledCourses.find((c) => c.nextLesson);
      const recommendation = firstNext?.nextLesson
        ? `\n\n**Recommended next step:** Jump into **${firstNext.nextLesson.title}** in **${firstNext.title}** (${firstNext.slug}), or ask me to quiz you on what you've completed so far.`
        : "\n\n**Recommended next step:** You've finished your enrolled lessons — ask me to recommend your next course from the catalog!";

      return {
        reply: `Here is your live learning progress (**${progress.totalCompletedLessons}** total lessons completed):\n\n${lines.join("\n")}${recommendation}`,
        quizzes,
        toolCalls,
      };
    }

    const firstCourse = catalog?.courses[0];
    return {
      reply: firstCourse
        ? `You haven't enrolled in any courses yet! A great place to start is **${firstCourse.title}** (${firstCourse.level}, ~${firstCourse.estimatedHours}h) — ${firstCourse.subtitle}.\n\nEnroll in a course and complete lessons to track your progress, or ask me for a **quick quiz** anytime.`
        : "You don't have any recorded lesson completions yet. Open any course lesson to start tracking progress, and I'll tailor your next steps automatically!",
      quizzes,
      toolCalls,
    };
  }

  if (activeLesson && !wantsCatalog) {
    toolCalls.push("get_lesson_content");
    const { headings, bullets, codeLanguages } = extractHeadingsAndBullets(
      activeLesson.markdownContent,
    );
    const sections = headings.slice(0, 5);
    const keyPoints = bullets.slice(0, 4);

    const parts: string[] = [
      `### ${activeLesson.lessonTitle}`,
      activeLesson.summary,
    ];

    if (sections.length > 0) {
      parts.push(
        `**What this lesson covers:**\n${sections.map((h) => `- ${h}`).join("\n")}`,
      );
    }

    if (keyPoints.length > 0) {
      parts.push(
        `**Key takeaways:**\n${keyPoints.map((b) => `- ${b}`).join("\n")}`,
      );
    }

    if (codeLanguages.length > 0) {
      parts.push(
        `This lesson includes hands-on **${codeLanguages.join(", ")}** code examples. Ask me to **quiz you on this lesson** or check **what to learn next**!`,
      );
    }

    return {
      reply: parts.join("\n\n"),
      quizzes,
      toolCalls,
    };
  }

  if (catalog && catalog.courses.length > 0) {
    toolCalls.push("list_courses");
    const courseLines = catalog.courses.slice(0, 6).map((course) => {
      const lessonTotal = course.modules.reduce(
        (sum, mod) => sum + mod.lessons.length,
        0,
      );
      return `- **${course.title}** (${course.tier.toUpperCase()} · ${course.level} · ${lessonTotal} lessons · ~${course.estimatedHours}h) — ${course.subtitle}`;
    });

    const contextHeader = pageContext?.courseTitle
      ? `You're currently viewing **${pageContext.courseTitle}**. Here's the live course catalog:\n\n`
      : `Here are the published courses available in **Vukora Studio**:\n\n`;

    return {
      reply: `${contextHeader}${courseLines.join("\n")}\n\nAsk me to **check your progress**, **summarize a lesson**, or **quiz you** on any course!`,
      quizzes,
      toolCalls,
    };
  }

  return {
    reply: `I'm **Vukora**, your Pro AI tutor${pageContext?.pageTitle ? ` (currently viewing **${pageContext.pageTitle}**)` : ""}. Ask me to summarize a lesson, check your learning progress, recommend your next course, or generate an **interactive quiz**!`,
    quizzes,
    toolCalls,
  };
}

export async function POST(request: Request) {
  const authContext = await getServerAuthContext();

  if (!authContext.isAuthenticated || !authContext.userId) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  if (!authContext.hasProAccess) {
    return NextResponse.json(
      { error: "Pro membership required for Vukora AI." },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 },
    );
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid chat payload.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { messages, pageContext } = parsed.data;
  const lastUserMessage =
    [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  const { getToken } = await auth();
  const convexToken =
    (await getToken({ template: "convex" }).catch(() => null)) ??
    (await getToken().catch(() => null));

  const publicConvex = createConvexClient();
  const authedConvex = createConvexClient(convexToken);

  const [catalogSnapshot, userProgress] = await Promise.all([
    publicConvex
      ? publicConvex
          .query(api.courses.getCatalogSnapshot, {
            courseSlug: pageContext?.courseSlug,
            lessonSlug: pageContext?.lessonSlug,
          })
          .catch(() => null)
      : Promise.resolve(null),
    authedConvex && convexToken
      ? authedConvex
          .query(api.enrollments.getUserProgressForAgent, {})
          .catch(() => null)
      : Promise.resolve(null),
  ]);

  const toolCallsUsed = new Set<string>();
  const collectedQuizzes: InteractiveQuizPayload[] = [];

  if (hasModelCredentials()) {
    try {
      const contextLines: string[] = [];
      if (pageContext) {
        contextLines.push(
          `Current page: ${pageContext.pageTitle} (${pageContext.pageType}, path: ${pageContext.pathname})`,
        );
        if (pageContext.courseTitle && pageContext.courseSlug) {
          contextLines.push(
            `Active course: ${pageContext.courseTitle} (slug: ${pageContext.courseSlug})`,
          );
        }
        if (pageContext.moduleTitle) {
          contextLines.push(`Active module: ${pageContext.moduleTitle}`);
        }
        if (pageContext.lessonTitle && pageContext.lessonSlug) {
          contextLines.push(
            `Active lesson: ${pageContext.lessonTitle} (slug: ${pageContext.lessonSlug})`,
          );
        }
        if (pageContext.lessonSummary) {
          contextLines.push(`Active lesson summary: ${pageContext.lessonSummary}`);
        }
      }

      const activeLessonContext = catalogSnapshot?.activeLesson
        ? [
            `\n## Active Lesson Content (${catalogSnapshot.activeLesson.lessonTitle})`,
            `Summary: ${catalogSnapshot.activeLesson.summary}`,
            catalogSnapshot.activeLesson.markdownContent.slice(0, 6000),
          ].join("\n")
        : "";

      const progressContext = userProgress
        ? `\n## Learner Progress Snapshot\nTotal completed lessons: ${userProgress.totalCompletedLessons}. Enrolled courses: ${
            userProgress.enrolledCourses
              .map(
                (c) =>
                  `${c.title} (${c.completedCount}/${c.totalLessons} completed${c.nextLesson ? `, next: ${c.nextLesson.title}` : ""})`,
              )
              .join("; ") || "None yet"
          }.`
        : "";

      const systemPrompt = [
        "You are Vukora, the friendly, sharp, deeply knowledgeable Pro AI tutor for Vukora (courses by Teddy, ted.code).",
        "Core teaching rules:",
        "1. Answer the learner's EXACT question directly and naturally — like a great senior engineer pairing with them. Never dump raw tool outputs or generic lesson outlines unless they explicitly ask for a summary.",
        "2. If they say hello or chat casually, greet them warmly in 1-2 sentences, acknowledge what they're currently studying if relevant, and offer 1-2 concrete ways you can help.",
        "3. When they ask 'why' or 'how' about a concept (e.g. Suspense, Cache Components, Convex, Clerk Billing, Mux, Eve), give a crystal-clear, intuitive mental model, explain what breaks if you do it wrong, and include a concise code snippet when helpful.",
        "4. Use your tools (`list_courses`, `get_lesson_content`, `get_user_progress`) when the learner asks about OTHER courses, OTHER lessons, or detailed progress recommendations.",
        "5. Whenever the learner asks for a quiz, practice questions, or a knowledge check, ALWAYS call `create_interactive_quiz` with 3 to 4 conceptual multiple-choice questions grounded in the material, then invite them to try the interactive quiz card below WITHOUT giving away the answers in your message.",
        "6. Keep formatting clean, scannable Markdown — concise, punchy, and genuinely insightful.",
        contextLines.length > 0
          ? `\n## Live Learner Context\n${contextLines.join("\n")}`
          : "",
        activeLessonContext,
        progressContext,
      ]
        .filter(Boolean)
        .join("\n");

      const modelId =
        process.env.VUKORA_MODEL ?? "anthropic/claude-sonnet-5";

      const result = await generateText({
        model: modelId,
        system: systemPrompt,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        stopWhen: stepCountIs(5),
        tools: {
          list_courses: tool({
            description:
              "List all published courses, modules, and lessons in Vukora Studio.",
            inputSchema: z.object({}),
            execute: async () => {
              toolCallsUsed.add("list_courses");
              if (catalogSnapshot) {
                return {
                  totalCourses: catalogSnapshot.courses.length,
                  courses: catalogSnapshot.courses,
                };
              }
              if (!publicConvex) {
                return { totalCourses: 0, courses: [] };
              }
              const fresh = await publicConvex.query(
                api.courses.getCatalogSnapshot,
                {},
              );
              return {
                totalCourses: fresh.courses.length,
                courses: fresh.courses,
              };
            },
          }),
          get_lesson_content: tool({
            description:
              "Fetch the full markdown content and details of a specific lesson by courseSlug and lessonSlug.",
            inputSchema: z.object({
              courseSlug: z.string().min(1),
              lessonSlug: z.string().min(1),
            }),
            execute: async ({ courseSlug, lessonSlug }) => {
              toolCallsUsed.add("get_lesson_content");
              if (
                catalogSnapshot?.activeLesson &&
                catalogSnapshot.activeLesson.courseSlug === courseSlug &&
                catalogSnapshot.activeLesson.lessonSlug === lessonSlug
              ) {
                return { found: true, lesson: catalogSnapshot.activeLesson };
              }
              if (!publicConvex) {
                return { found: false, error: "Catalog unavailable." };
              }
              const fresh = await publicConvex.query(
                api.courses.getCatalogSnapshot,
                { courseSlug, lessonSlug },
              );
              if (!fresh.activeLesson) {
                return {
                  found: false,
                  error: `Lesson "${lessonSlug}" in "${courseSlug}" not found.`,
                };
              }
              return { found: true, lesson: fresh.activeLesson };
            },
          }),
          get_user_progress: tool({
            description:
              "Fetch the authenticated learner's enrolled courses, completed lessons, and next lessons.",
            inputSchema: z.object({}),
            execute: async () => {
              toolCallsUsed.add("get_user_progress");
              if (userProgress) {
                return { authenticated: true, ...userProgress };
              }
              return {
                authenticated: Boolean(convexToken),
                enrolledCourses: [],
                totalCompletedLessons: 0,
              };
            },
          }),
          create_interactive_quiz: tool({
            description:
              "Create an interactive multiple-choice quiz rendered inline inside Vukora chat.",
            inputSchema: quizSchema,
            execute: async (input) => {
              toolCallsUsed.add("create_interactive_quiz");
              const normalized: InteractiveQuizPayload = {
                title: input.title,
                topic: input.topic,
                questions: input.questions.map((q) => ({
                  ...q,
                  correctIndex: Math.min(q.correctIndex, q.options.length - 1),
                })),
              };
              collectedQuizzes.push(normalized);
              return normalized;
            },
          }),
        },
      });

      const replyText = result.text.trim();
      if (replyText || collectedQuizzes.length > 0) {
        return NextResponse.json({
          reply:
            replyText ||
            "I've generated an interactive quiz below — pick your answers and check your score!",
          quizzes: collectedQuizzes,
          toolCalls: Array.from(toolCallsUsed),
        });
      }
    } catch (err) {
      console.error("[vukora] AI Gateway generation failed:", err);
      // Fall back to live Convex context synthesis when gateway/provider credentials fail.
    }
  }

  const fallback = buildFallbackResponse({
    lastUserMessage,
    pageContext,
    catalog: catalogSnapshot,
    progress: userProgress,
  });

  return NextResponse.json(fallback);
}
