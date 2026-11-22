import { internalMutation, mutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { requireAdmin } from "./lib/auth";

const DEMO_MUX_PLAYBACK_ID = "BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM";

interface SeedLesson {
  title: string;
  slug: string;
  summary: string;
  isFreePreview: boolean;
  durationSeconds: number;
  muxPlaybackId: string;
  markdownContent: string;
  quiz: Array<{
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>;
}

interface SeedModule {
  title: string;
  description: string;
  lessons: SeedLesson[];
}

interface SeedCourse {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  thumbnailUrl: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  tier: "free" | "pro";
  featured: boolean;
  estimatedHours: number;
  tags: string[];
  modules: SeedModule[];
}

const SEED_COURSES: SeedCourse[] = [
  {
    slug: "nextjs-16-react-19-mastery",
    title: "Next.js 16 & React 19 Architecture",
    subtitle:
      "Master Cache Components, Partial Prerendering, proxy.ts, and Server Functions with production patterns.",
    description:
      "A hands-on engineering course taking you deep into Next.js 16 and React 19. Build blazing-fast apps using Cache Components, Suspense streaming boundaries, the React Compiler, and clean full-stack data flows.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
    category: "Frontend & Full-Stack",
    level: "intermediate",
    tier: "free",
    featured: true,
    estimatedHours: 6,
    tags: ["Next.js 16", "React 19", "TypeScript", "Tailwind v4"],
    modules: [
      {
        title: "Module 1: Modern Next.js 16 Foundations",
        description:
          "Understand Cache Components, Partial Prerendering, and the new proxy.ts request lifecycle.",
        lessons: [
          {
            title: "Cache Components & Suspense Boundaries",
            slug: "cache-components-and-suspense",
            summary:
              "Learn how Next.js 16 prerenders static shells while streaming dynamic per-user data inside Suspense.",
            isFreePreview: true,
            durationSeconds: 740,
            muxPlaybackId: DEMO_MUX_PLAYBACK_ID,
            markdownContent: `# Cache Components & Suspense Boundaries

Next.js 16 introduces **Cache Components** (\`cacheComponents: true\`) as the default rendering model. Instead of deciding between "fully static" or "fully dynamic" at the route level, you compose static shells and dynamic holes in the same tree.

## Why \`<Suspense>\` Matters for Request Data

Whenever a Server Component reads cookies, headers, or Clerk's \`await auth()\`, it opts that subtree into request-time rendering. Wrapping only that subtree in \`<Suspense>\` lets the outer layout and hero prerender instantly.

\`\`\`tsx
import { auth } from "@clerk/nextjs/server";
import { Suspense } from "react";

async function UserBadge() {
  const { isAuthenticated, userId } = await auth();
  if (!isAuthenticated) return <span>Guest</span>;
  return <span>Signed in ({userId.slice(0, 8)})</span>;
}

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4">
      <span className="font-semibold">LMS Platform</span>
      <Suspense fallback={<div className="h-8 w-24 animate-pulse rounded bg-zinc-200" />}>
        <UserBadge />
      </Suspense>
    </header>
  );
}
\`\`\`

## Key Takeaways

- Keep static layout chrome **outside** \`<Suspense>\`.
- Move \`await auth()\` and uncached database reads into small async child components.
- Use \`'use cache'\` for shared data that can be cached across requests, passing any user identifier explicitly as an argument.`,
            quiz: [
              {
                id: "q1",
                question:
                  "What happens in Next.js 16 with cacheComponents enabled if you call await auth() directly in a Server Component outside a Suspense boundary?",
                options: [
                  "The entire app falls back to client-side rendering",
                  "next build fails because uncached request data is read outside Suspense",
                  "auth() automatically caches the first user's session",
                  "Nothing — Next.js wraps it in Suspense automatically",
                ],
                correctIndex: 1,
                explanation:
                  "With cacheComponents enabled, reading request-time data outside Suspense fails prerendering during next build so you explicitly control streaming boundaries.",
              },
              {
                id: "q2",
                question:
                  "Where should static layout chrome (navigation shell, footer) live relative to auth Suspense boundaries?",
                options: [
                  "Inside the same Suspense boundary as auth()",
                  "Inside a Client Component only",
                  "Outside Suspense so it prerenders into the static HTML shell",
                  "In proxy.ts",
                ],
                correctIndex: 2,
                explanation:
                  "Keeping static layout outside Suspense allows Next.js to prerender the shell immediately while streaming only the personalized controls.",
              },
            ],
          },
          {
            title: "Replacing middleware.ts with proxy.ts",
            slug: "replacing-middleware-with-proxy",
            summary:
              "Configure clerkMiddleware() inside Next.js 16's proxy.ts and enforce route-level authorization close to data.",
            isFreePreview: true,
            durationSeconds: 615,
            muxPlaybackId: DEMO_MUX_PLAYBACK_ID,
            markdownContent: `# Replacing \`middleware.ts\` with \`proxy.ts\`

In Next.js 16, the root request interception convention moved from \`middleware.ts\` to \`proxy.ts\`. With Clerk Core 3 (\`@clerk/nextjs\` v7+), keep \`clerkMiddleware()\` clean and enforce protection right next to your pages, Route Handlers, and Server Actions.

\`\`\`ts
// proxy.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
\`\`\`

## Defense-in-Depth Route Protection

Always verify authentication **and** authorization inside every sensitive Route Handler and Server Component:

\`\`\`ts
import { auth } from "@clerk/nextjs/server";

export async function POST() {
  const { isAuthenticated, has } = await auth();
  if (!isAuthenticated) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!has({ plan: "pro" })) {
    return Response.json({ error: "Pro plan required" }, { status: 403 });
  }
  return Response.json({ ok: true });
}
\`\`\``,
            quiz: [
              {
                id: "q1",
                question:
                  "Which HTTP status code should an API route return when a signed-in free user calls a Pro-only endpoint?",
                options: ["401 Unauthorized", "403 Forbidden", "404 Not Found", "422 Unprocessable"],
                correctIndex: 1,
                explanation:
                  "401 means the caller is not authenticated; 403 means the caller is authenticated but lacks the required plan or permission.",
              },
            ],
          },
        ],
      },
      {
        title: "Module 2: Accessible UI with Vercel Labs UI SDK",
        description:
          "Compose keyboard-navigable dialogs, tabs, accordions, and popovers using @ui-sdk/react.",
        lessons: [
          {
            title: "Behavior-First Components with @ui-sdk/react",
            slug: "behavior-first-ui-sdk",
            summary:
              "Stop hand-rolling ARIA widgets — compose accessible Dialogs, Tabs, and Accordions with @ui-sdk/react.",
            isFreePreview: true,
            durationSeconds: 820,
            muxPlaybackId: DEMO_MUX_PLAYBACK_ID,
            markdownContent: `# Behavior-First Components with \`@ui-sdk/react\`

Every interactive primitive in **UI SDK** separates accessible behavior (keyboard navigation, focus trapping, ARIA states, top-layer popups) from visual styling.

## Golden Rules

1. Import each primitive from its own entry point (\`@ui-sdk/react/tabs\`, \`@ui-sdk/react/accordion\`).
2. Declare \`@layer ui-sdk;\` at the very top of \`app/globals.css\` above \`@import "tailwindcss";\`.
3. Style directly from state attributes like \`data-open:\`, \`data-selected:\`, and \`data-pressed:\`.

\`\`\`tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTab } from "@ui-sdk/react/tabs";

export function LessonTabs() {
  return (
    <Tabs defaultValue="notes">
      <TabsList className="flex gap-2 border-b border-zinc-200">
        <TabsTab
          value="notes"
          className="px-4 py-2 text-sm font-medium data-selected:border-b-2 data-selected:border-zinc-950"
        >
          Lesson Notes
        </TabsTab>
        <TabsTab
          value="quiz"
          className="px-4 py-2 text-sm font-medium data-selected:border-b-2 data-selected:border-zinc-950"
        >
          Interactive Quiz
        </TabsTab>
      </TabsList>
      <TabsContent value="notes">Rich markdown notes...</TabsContent>
      <TabsContent value="quiz">Interactive quiz panel...</TabsContent>
    </Tabs>
  );
}
\`\`\``,
            quiz: [
              {
                id: "q1",
                question:
                  "Where must @layer ui-sdk; be placed in a Tailwind CSS v4 global stylesheet?",
                options: [
                  "At the bottom of globals.css",
                  "Inside a CSS module",
                  "At the top of globals.css, above @import \"tailwindcss\";",
                  "Inside next.config.mjs",
                ],
                correctIndex: 2,
                explanation:
                  "Declaring @layer ui-sdk; above @import \"tailwindcss\"; ensures your Tailwind utilities always win the CSS cascade over ui-sdk's minimal structural rules.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "fullstack-ai-saas-convex-clerk",
    title: "Full-Stack AI SaaS with Convex & Clerk Billing",
    subtitle:
      "Build a real-time multi-tier SaaS with Clerk Billing, JWT-verified Convex functions, and role-based admin dashboards.",
    description:
      "Ship a revenue-ready SaaS from scratch. Connect Clerk authentication and Clerk Billing directly to Convex's reactive TypeScript database, build custom checkout flows with CheckoutButton, and lock down admin mutations server-side.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    category: "SaaS & Backend",
    level: "intermediate",
    tier: "pro",
    featured: true,
    estimatedHours: 11,
    tags: ["Convex", "Clerk Billing", "RBAC", "Real-Time"],
    modules: [
      {
        title: "Module 1: Real-Time Schema & Auth Bridge",
        description:
          "Design indexed Convex tables and link Clerk's JWT issuer to Convex for zero-latency auth.",
        lessons: [
          {
            title: "Connecting Clerk JWTs to Convex (Free Preview)",
            slug: "connecting-clerk-jwts-to-convex",
            summary:
              "Configure convex/auth.config.ts, Clerk's aud: 'convex' claim, and ConvexProviderWithClerk.",
            isFreePreview: true,
            durationSeconds: 790,
            muxPlaybackId: DEMO_MUX_PLAYBACK_ID,
            markdownContent: `# Connecting Clerk JWTs to Convex

Convex validates incoming Clerk session tokens automatically once two pieces align:

1. Clerk includes \`"aud": "convex"\` in its session token claims.
2. \`convex/auth.config.ts\` declares your Clerk Frontend API URL as \`domain\` with \`applicationID: "convex"\`.

\`\`\`ts
// convex/auth.config.ts
import type { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
\`\`\`

## Authorizing Queries & Mutations Safely

Never trust a \`userId\` passed in mutation arguments. Always derive identity on the server with \`ctx.auth.getUserIdentity()\`:

\`\`\`ts
export const enroll = mutation({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    return await ctx.db.insert("enrollments", {
      userId: identity.tokenIdentifier,
      clerkUserId: identity.subject,
      courseId: args.courseId,
      enrolledAt: Date.now(),
    });
  },
});
\`\`\``,
            quiz: [
              {
                id: "q1",
                question:
                  "Which field on ctx.auth.getUserIdentity() is the canonical stable key for ownership lookups in Convex?",
                options: [
                  "identity.email",
                  "identity.tokenIdentifier",
                  "identity.name",
                  "args.userId",
                ],
                correctIndex: 1,
                explanation:
                  "tokenIdentifier uniquely combines the issuer and subject, making it the guaranteed stable identity key across providers.",
              },
            ],
          },
          {
            title: "Clerk Billing: Custom Pricing & CheckoutButton",
            slug: "clerk-billing-custom-checkout",
            summary:
              "Build a custom Monthly/Yearly pricing page with 2 months free using Clerk's CheckoutButton.",
            isFreePreview: false,
            durationSeconds: 920,
            muxPlaybackId: DEMO_MUX_PLAYBACK_ID,
            markdownContent: `# Clerk Billing: Custom Pricing & \`<CheckoutButton />\`

Instead of being locked into a single prebuilt table layout, Clerk's \`<CheckoutButton />\` from \`@clerk/nextjs/experimental\` lets you craft a completely custom pricing experience while still launching Clerk's secure checkout drawer.

\`\`\`tsx
"use client";

import { Show } from "@clerk/nextjs";
import { CheckoutButton } from "@clerk/nextjs/experimental";

export function ProUpgradeButton({
  planId,
  period,
}: {
  planId: string;
  period: "month" | "annual";
}) {
  return (
    <Show when="signed-in">
      <CheckoutButton
        planId={planId}
        planPeriod={period}
        for="user"
        newSubscriptionRedirectUrl="/dashboard"
      >
        <button className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white">
          Upgrade to Pro ({period === "annual" ? "2 Months Free" : "Monthly"})
        </button>
      </CheckoutButton>
    </Show>
  );
}
\`\`\`

## Checking Plan Entitlements Everywhere

- **Server Components & Route Handlers:** \`const { has } = await auth(); has({ plan: "pro" })\`
- **Client Components:** \`const { has } = useAuth(); has?.({ plan: "pro" })\``,
            quiz: [
              {
                id: "q1",
                question:
                  "Which prop on Clerk's <CheckoutButton /> switches between monthly and yearly billing?",
                options: [
                  "interval=\"yearly\"",
                  "planPeriod=\"month\" | \"annual\"",
                  "billingCycle=\"year\"",
                  "frequency=\"annual\"",
                ],
                correctIndex: 1,
                explanation:
                  "CheckoutButton accepts planPeriod=\"month\" or planPeriod=\"annual\" alongside planId and for=\"user\".",
              },
            ],
          },
        ],
      },
      {
        title: "Module 2: Single-Admin RBAC & Content Studio",
        description:
          "Secure an admin studio using Clerk publicMetadata roles embedded directly in session JWTs.",
        lessons: [
          {
            title: "Server-Verified Admin Roles in Clerk & Convex",
            slug: "server-verified-admin-roles",
            summary:
              "Expose user.public_metadata in Clerk session claims and enforce requireAdmin() in every Convex mutation.",
            isFreePreview: false,
            durationSeconds: 860,
            muxPlaybackId: DEMO_MUX_PLAYBACK_ID,
            markdownContent: `# Server-Verified Admin Roles in Clerk & Convex

For a single-admin creator platform, store \`{ "role": "admin" }\` in Clerk's \`publicMetadata\` and map it into the session token claims:

\`\`\`json
{
  "aud": "convex",
  "metadata": "{{user.public_metadata}}"
}
\`\`\`

Because the JWT is cryptographically signed by Clerk, both your Next.js Server Components **and** your Convex mutations can verify admin privileges without an extra network round-trip.

\`\`\`ts
export async function requireAdmin(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");
  const meta = (identity as Record<string, unknown>).metadata as
    | { role?: string }
    | undefined;
  if (meta?.role !== "admin") {
    throw new Error("Admin access required");
  }
  return identity;
}
\`\`\``,
            quiz: [
              {
                id: "q1",
                question:
                  "Why should admin roles live in Clerk publicMetadata (or privateMetadata) rather than unsafeMetadata?",
                options: [
                  "unsafeMetadata is larger",
                  "unsafeMetadata can be edited by the client browser, whereas publicMetadata can only be modified server-side",
                  "publicMetadata is encrypted with AES-512",
                  "Convex cannot read unsafeMetadata",
                ],
                correctIndex: 1,
                explanation:
                  "Clients can mutate unsafeMetadata directly, which would let any user escalate themselves to admin. publicMetadata is read-only on the client.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "autonomous-ai-agents-vercel-eve",
    title: "Durable AI Agents with Vercel Eve",
    subtitle:
      "Author filesystem-first AI agents with typed tools, Clerk JWT route auth, context awareness, and interactive UI widgets.",
    description:
      "Go beyond basic chatbots. Learn how to architect durable, authenticated backend agents using Vercel Eve — complete with custom tools, memoized dynamic instructions, human-in-the-loop approvals, and embedded interactive quiz widgets.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
    category: "AI Engineering",
    level: "advanced",
    tier: "pro",
    featured: true,
    estimatedHours: 9,
    tags: ["Vercel Eve", "AI SDK", "Clerk Auth", "Tool Calling"],
    modules: [
      {
        title: "Module 1: Filesystem-First Agent Architecture",
        description:
          "Structure multi-agent workspaces under agents/<name>/agent/ and wire secure Clerk authentication.",
        lessons: [
          {
            title: "Structuring a Vercel Eve Workspace (Free Preview)",
            slug: "structuring-vercel-eve-workspace",
            summary:
              "Explore instructions.md, agent.ts, tools/, and channels/eve.ts in an Eve multi-agent workspace.",
            isFreePreview: true,
            durationSeconds: 705,
            muxPlaybackId: DEMO_MUX_PLAYBACK_ID,
            markdownContent: `# Structuring a Vercel Eve Workspace

**Vercel Eve** treats an AI agent as a clean directory of files on disk. When you plan to grow beyond a single agent, place each agent under \`agents/<name>/agent/\`:

\`\`\`text
agents/
└── vukora/
    └── agent/
        ├── agent.ts          # defineAgent({ model })
        ├── instructions.md   # stable tutor system prompt
        ├── channels/
        │   └── eve.ts        # Clerk JWT route authentication
        └── tools/
            ├── list_courses.ts
            ├── get_user_progress.ts
            └── create_interactive_quiz.ts
\`\`\`

## Critical Rule for \`defineDynamic\`

Any \`defineDynamic\` resolver runs before **every** model call in a turn — not just once per turn. Always wrap network requests or database reads in \`ctx.memo(key, fn)\` so you never hammer your database during multi-step tool loops.`,
            quiz: [
              {
                id: "q1",
                question:
                  "Why must network and database calls inside a Vercel Eve defineDynamic function be wrapped in ctx.memo(key, fn)?",
                options: [
                  "Because Eve runs defineDynamic before every model call in a turn, not just once per turn",
                  "Because async/await is not supported in defineDynamic",
                  "Because ctx.memo encrypts the response",
                  "Because TypeScript requires it",
                ],
                correctIndex: 0,
                explanation:
                  "Without ctx.memo, every step in a multi-tool turn would repeat the same DB or API fetch.",
              },
            ],
          },
          {
            title: "Securing Eve Channels with Clerk JWT Verification",
            slug: "securing-eve-with-clerk-jwt",
            summary:
              "Authenticate inbound HTTP agent requests with @clerk/backend verifyToken and enforce Pro-tier access.",
            isFreePreview: false,
            durationSeconds: 880,
            muxPlaybackId: DEMO_MUX_PLAYBACK_ID,
            markdownContent: `# Securing Eve Channels with Clerk JWT Verification

Eve fails closed in production: every request to \`/eve/v1/*\` passes through the ordered \`auth\` walk in \`channels/eve.ts\`.

\`\`\`ts
import { verifyToken } from "@clerk/backend";
import {
  extractBearerToken,
  ForbiddenError,
  type AuthFn,
} from "eve/channels/auth";
import { eveChannel } from "eve/channels/eve";

const clerkProAuth: AuthFn<Request> = async (request) => {
  const token = extractBearerToken(request.headers.get("authorization"));
  if (!token) return null;

  const claims = await verifyToken(token, {
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  const pla = typeof claims.pla === "string" ? claims.pla : "";
  const isPro = pla.split(",").some((p) => p === "u:pro" || p === "pro");
  if (!isPro) {
    throw new ForbiddenError({ message: "Vukora requires a Pro subscription." });
  }

  return {
    authenticator: "clerk",
    principalId: claims.sub,
    principalType: "user",
    attributes: { plan: "pro" },
  };
};

export default eveChannel({ auth: [clerkProAuth] });
\`\`\``,
            quiz: [
              {
                id: "q1",
                question:
                  "What happens if an Eve AuthFn throws ForbiddenError during the auth walk?",
                options: [
                  "Eve falls through to the next authenticator",
                  "Eve rejects the request immediately with HTTP 403",
                  "Eve retries the request with localDev()",
                  "Eve starts an anonymous session",
                ],
                correctIndex: 1,
                explanation:
                  "Returning null skips to the next entry, whereas throwing ForbiddenError stops the walk and returns HTTP 403 immediately.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "modern-video-mux-videojs-10",
    title: "Production Video Streaming with Mux & Video.js 10",
    subtitle:
      "Stream adaptive HLS video with Video.js 10, Mux Data analytics, and direct browser uploads in your admin studio.",
    description:
      "Build a cinema-grade video learning pipeline. Learn how to integrate Video.js 10 with Mux Video and Mux Data, generate signed direct-upload URLs using @mux/ts, and track asset readiness inside Convex.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1200&q=80",
    category: "Video & Media",
    level: "beginner",
    tier: "free",
    featured: false,
    estimatedHours: 4,
    tags: ["Mux", "Video.js 10", "HLS", "Direct Uploads"],
    modules: [
      {
        title: "Module 1: Playback & Direct Uploads",
        description:
          "Embed Video.js 10 with Mux Video playback and wire browser-to-Mux direct uploads.",
        lessons: [
          {
            title: "Composable Mux Playback with Video.js 10",
            slug: "composable-mux-playback-videojs-10",
            summary:
              "Mount VideoPlayer, VideoSkin, MuxVideo, and MuxData in Next.js App Router for adaptive streaming.",
            isFreePreview: true,
            durationSeconds: 650,
            muxPlaybackId: DEMO_MUX_PLAYBACK_ID,
            markdownContent: `# Composable Mux Playback with Video.js 10

For new React and Next.js video players, Mux recommends **Video.js 10** (\`@videojs/react\`, \`@videojs/mux-video\`, \`@videojs/mux-data\`) instead of the legacy Mux Player package.

\`\`\`tsx
"use client";

import "@videojs/react/video/skin.css";
import { VideoPlayer, VideoSkin } from "@videojs/react/video";
import { MuxVideo } from "@videojs/react/media/mux-video";
import { MuxData } from "@videojs/react/extensions/mux-data";

export function CourseVideoPlayer({ playbackId }: { playbackId: string }) {
  return (
    <VideoPlayer>
      <VideoSkin style={{ width: "100%", aspectRatio: "16 / 9" }}>
        <MuxVideo source={{ playbackId }} playsInline />
        <MuxData />
      </VideoSkin>
    </VideoPlayer>
  );
}
\`\`\`

## Direct Browser Uploads with \`@mux/ts\`

Rather than proxying gigabyte video files through your Next.js server, generate an authenticated direct-upload URL on the server with \`mux.video.uploads.create()\` and PUT the file straight from the admin browser to Mux.`,
            quiz: [
              {
                id: "q1",
                question:
                  "Why should admin course video uploads use Mux Direct Uploads instead of uploading through a Next.js API route body?",
                options: [
                  "Next.js cannot parse binary files",
                  "Direct Uploads stream video straight from the browser to Mux without hitting server body limits or timeouts",
                  "Direct Uploads skip video encoding",
                  "Mux does not allow server uploads",
                ],
                correctIndex: 1,
                explanation:
                  "Direct Uploads bypass serverless payload limits and double-hop bandwidth by letting the browser upload straight to Mux's resumable endpoint.",
              },
            ],
          },
        ],
      },
    ],
  },
];

async function runSeed(ctx: MutationCtx) {
  let createdCourses = 0;
  let createdModules = 0;
  let createdLessons = 0;
  const now = Date.now();

  for (let cIdx = 0; cIdx < SEED_COURSES.length; cIdx++) {
    const courseData = SEED_COURSES[cIdx];
    const existing = await ctx.db
      .query("courses")
      .withIndex("by_slug", (q) => q.eq("slug", courseData.slug))
      .unique();
    if (existing) continue;

    const courseId = await ctx.db.insert("courses", {
      slug: courseData.slug,
      title: courseData.title,
      subtitle: courseData.subtitle,
      description: courseData.description,
      thumbnailUrl: courseData.thumbnailUrl,
      category: courseData.category,
      level: courseData.level,
      tier: courseData.tier,
      published: true,
      featured: courseData.featured,
      estimatedHours: courseData.estimatedHours,
      tags: courseData.tags,
      tutorName: "Teddy",
      tutorTitle: "Frontend engineer and instructor",
      order: cIdx,
      createdAt: now,
      updatedAt: now,
    });
    createdCourses++;

    for (let mIdx = 0; mIdx < courseData.modules.length; mIdx++) {
      const modData = courseData.modules[mIdx];
      const moduleId = await ctx.db.insert("modules", {
        courseId,
        title: modData.title,
        description: modData.description,
        order: mIdx,
        createdAt: now,
        updatedAt: now,
      });
      createdModules++;

      for (let lIdx = 0; lIdx < modData.lessons.length; lIdx++) {
        const lessonData = modData.lessons[lIdx];
        await ctx.db.insert("lessons", {
          courseId,
          moduleId,
          title: lessonData.title,
          slug: lessonData.slug,
          summary: lessonData.summary,
          order: lIdx,
          isFreePreview: lessonData.isFreePreview,
          durationSeconds: lessonData.durationSeconds,
          markdownContent: lessonData.markdownContent,
          muxPlaybackId: lessonData.muxPlaybackId,
          muxStatus: "ready",
          quiz: lessonData.quiz,
          createdAt: now,
          updatedAt: now,
        });
        createdLessons++;
      }
    }
  }

  return { createdCourses, createdModules, createdLessons };
}

export const seedCourses = internalMutation({
  args: {},
  handler: async (ctx) => {
    return await runSeed(ctx);
  },
});

export const seedSampleCoursesAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await runSeed(ctx);
  },
});
