# Interflect

**Think better, design better.** Interflect is an online learning platform for UI/UX design and frontend craft. Learners browse courses, watch narrated video lessons with subtitles and a searchable transcript, read lesson notes with live HTML/CSS previews, take quizzes, and track their progress on a personal dashboard. Admins run everything from a built-in content studio.

It ships with four complete sample courses (11 lessons) on visual hierarchy, typography, accessible components and design systems.

---

## Features

**For learners**
- Course catalog, course pages and lesson pages that update live (no refresh needed)
- Video lessons with **closed captions** and a **transcript** you can search, copy, and click to jump to a moment
- Lesson notes in Markdown with syntax-highlighted code and sandboxed design previews
- Quizzes with feedback, scored on the server
- Dashboard with progress, weekly goal, streak, calendar and tracked courses
- Light, dark and system themes; accessible, keyboard-friendly UI

**For admins** (`/admin`)
- Create and edit courses, modules and lessons, write Markdown notes, build quizzes
- Upload lesson videos (Convex storage or Mux) or paste a YouTube, Vimeo or Loom link
- Learner analytics overview

**Under the hood**
- Paywall enforced on the server: locked lessons never send their video, notes, quiz or transcript
- Abuse protection with the [Convex rate limiter](https://www.convex.dev/components/rate-limiter): per-user limits on quiz submissions, progress writes and the AI tutor, plus a global cap on tutor spend
- Security headers (no framing, nosniff, HSTS, strict referrer), branded 404 and error pages
- Feature switches for Pro billing and the AI tutor (see [Feature switches](#feature-switches))

## Tech stack

| Layer | Tool |
|---|---|
| Frontend | [Next.js 16](https://nextjs.org) (App Router, Cache Components, React Compiler), React 19, Tailwind CSS 4 |
| UI components | [`@ui-sdk/react`](https://github.com/vercel-labs/ui) (accessible dialogs, menus, tabs, toasts…) |
| Backend and database | [Convex](https://convex.dev) (queries, mutations, file storage, rate limiter component) |
| Auth and billing | [Clerk](https://clerk.com) (sign-in, Pro plan via Clerk Billing, admin role) |
| Video | Convex file storage, or [Mux](https://mux.com) uploads, or pasted YouTube, Vimeo or Loom links |
| AI tutor (optional, off by default) | [Vercel AI SDK](https://ai-sdk.dev) through the Vercel AI Gateway; a standalone [Eve](https://github.com/vercel/eve) agent lives in `agents/vukora/` |

## Project structure

```text
app/                     Next.js routes
  (marketing)/           Landing, pricing, sign-in/up
  (app)/                 Courses, lessons, dashboard, admin
  api/                   Mux upload routes, AI tutor route
  not-found.tsx, error.tsx, global-error.tsx
components/              UI (course player, transcript, admin studio, dashboard…)
convex/                  Backend: schema, queries/mutations, seed data, rate limits
  lib/features.ts        PRO_ENABLED and TUTOR_ENABLED switches
lib/                     Shared helpers (auth context, formatting)
agents/vukora/           Standalone Eve version of the AI tutor (optional)
course-creator-output/   Lesson scripts and the tooling that builds the lesson videos
```

---

## Setup guide

Setting it up takes about 15 minutes. You'll need free accounts on **Clerk** and **Convex**. Mux and an AI Gateway key are optional.

### Prerequisites

- **Node.js 20.9 or newer** (22 LTS recommended)
- **pnpm 11**. The repo pins it; `corepack enable` installs the right version.
- **Git**
- A **Clerk** account: <https://dashboard.clerk.com>
- A **Convex** account: <https://dashboard.convex.dev>. The CLI signs you in on first run.

### 1. Clone and install

```bash
git clone https://github.com/dev-ted/interflect.git
cd interflect
corepack enable
pnpm install
```

### 2. Create the Clerk application

In the [Clerk dashboard](https://dashboard.clerk.com):

1. **Create an application.** Any sign-in methods you like (email and Google work well). Copy the **Publishable key** (`pk_test_…`) and **Secret key** (`sk_test_…`).
2. **Connect Clerk to Convex.** Go to **Integrations → Convex** and turn it on. That makes Clerk's session token carry `"aud": "convex"`. Creating a JWT template named `convex` also works; the app accepts either.
3. **Add the admin and plan claims to the session token.** Go to **Sessions → Customize session token** and set:
   ```json
   { "metadata": "{{user.public_metadata}}" }
   ```
   Without this, the app can't see the `admin` role.
4. **Copy your Frontend API URL**, for example `https://your-app-123.clerk.accounts.dev`. Convex needs it in step 4.
5. *(Optional, only if you'll turn Pro on.)* Go to **Billing**, turn it on, and create a plan with the slug **`pro`**. Optionally add the features `pro_courses` and `vukora_ai`. Copy the plan ID (`cplan_…`).

### 3. Create `.env.local`

```bash
cp .env.example .env.local
```

Fill in:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard

# Only needed when Pro billing is switched on
NEXT_PUBLIC_CLERK_PRO_PLAN_ID=cplan_...

# Optional: Mux, only to upload videos through Mux in /admin
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=

# Optional: AI tutor (also set TUTOR_ENABLED = true, see below)
AI_GATEWAY_API_KEY=
```

Leave `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL` and `NEXT_PUBLIC_CONVEX_SITE_URL` alone. The next step writes them for you. **Never commit `.env.local`.** It's already in `.gitignore`.

### 4. Create your Convex backend

```bash
npx convex dev --once
```

This signs you in to Convex, creates **your own** dev deployment, pushes the schema and functions (including the rate limiter component), and writes the Convex URLs into `.env.local`.

Then tell Convex which Clerk app to trust. This value goes in **Convex's environment**, not `.env.local`:

```bash
npx convex env set CLERK_JWT_ISSUER_DOMAIN https://your-app-123.clerk.accounts.dev
npx convex dev --once
```

### 5. Load the sample courses

```bash
npx convex run seed:seedCourses
```

This adds the four courses, their modules, lessons, notes and quizzes. Running it again skips courses that already exist. The sample lessons play a public demo video until you upload your own. The lesson videos, captions and transcripts shown on the live site are stored in the owner's Convex storage, so they don't come with the clone.

### 6. Start the app

```bash
pnpm dev
```

This runs Next.js and Convex together. Open <http://localhost:3000>.

### 7. Make yourself an admin

1. Sign up in the app.
2. In the Clerk dashboard, open **Users → your user → Public metadata** and set:
   ```json
   { "role": "admin" }
   ```
3. Sign out and back in. `/admin` now opens.

### 8. Check it works

- `/courses` lists four courses, and a lesson page shows notes and a quiz.
- Submitting a quiz while signed in saves a result on `/dashboard`.
- `/admin` opens for your admin account.
- `/does-not-exist` shows the branded 404 page.

---

## Feature switches

Both live in [`convex/lib/features.ts`](convex/lib/features.ts) and are read by both Convex and Next.js. After changing one, run `npx convex dev --once`, or keep `pnpm dev` running.

| Switch | Default | What it does |
|---|---|---|
| `PRO_ENABLED` | `false` | While `false`, every course is free and pricing and upgrade UI is hidden. Set `true` to turn on the Clerk Billing paywall (needs the `pro` plan and `NEXT_PUBLIC_CLERK_PRO_PLAN_ID`). |
| `TUTOR_ENABLED` | `false` | While `false`, the AI tutor widget and landing section are hidden and `/api/vukora/chat` returns 404. Set `true` once `AI_GATEWAY_API_KEY` works. The model defaults to `anthropic/claude-sonnet-5`; override with `VUKORA_MODEL`. |

## Rate limits

Defined in [`convex/lib/rateLimits.ts`](convex/lib/rateLimits.ts). They're sized well above normal use.

| Limit | Allowance |
|---|---|
| AI tutor, per learner | 30 per hour, bursts of 10 |
| AI tutor, all users | 600 per hour |
| Quiz submissions, per learner | 10 per minute |
| Enrol, progress, tracking and settings writes, per learner | 60 per minute |

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Next.js and Convex dev servers together |
| `pnpm build` / `pnpm start` | Production build and serve |
| `pnpm lint` | ESLint |
| `npx convex dev --once` | Push Convex schema and functions once |
| `npx convex run seed:seedCourses` | Load the sample courses |
| `pnpm eve:dev` | Run the standalone Eve tutor agent (optional) |

## Deploying

1. Create a Convex **production** deployment and set `CLERK_JWT_ISSUER_DOMAIN` there (`npx convex env set --prod …`).
2. Deploy the Next.js app (for example on [Vercel](https://vercel.com)) with the same variables as `.env.local`. Set the build command to `npx convex deploy --cmd 'pnpm build'` and add a `CONVEX_DEPLOY_KEY` from the Convex dashboard.
3. Use Clerk production keys and add your domain in Clerk.

## Making your own lesson videos (optional)

`course-creator-output/` holds the lesson scripts (`03-lessons/`) and the tooling (`media/_tools/`) that turned them into the videos on the live site:

- Narration is generated in ElevenLabs.
- Slides are rendered from HTML with headless Chrome.
- Slide cuts are aligned to the speech with `faster-whisper`, then the video is muxed with `ffmpeg`.
- The video is uploaded to Convex storage with `files:attachLessonVideo`.
- Captions and transcripts are built from the same alignment (`transcript.py`) and attached with `attach-transcript.sh`.

The generated audio, video and slide images aren't in git.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Signed in, but Convex treats you as signed out | Check the Clerk Convex integration is on (or a `convex` JWT template exists), and that `CLERK_JWT_ISSUER_DOMAIN` in Convex exactly matches your Clerk Frontend API URL. Then run `npx convex dev --once` again. |
| `/admin` stays locked | Set `publicMetadata.role = "admin"`, add the `metadata` claim to the session token (step 2.3), then sign out and back in. |
| Checkout fails | With `PRO_ENABLED = true`, set `NEXT_PUBLIC_CLERK_PRO_PLAN_ID` to your own plan. The built-in fallback ID belongs to the original project. |
| Tutor gives canned answers | The AI Gateway key is missing or invalid. Use `AI_GATEWAY_API_KEY` (an Anthropic key alone isn't enough), and set `TUTOR_ENABLED = true`. |
| "You've sent a lot of messages…" | That's the tutor rate limit. Wait the time shown. |

> **Note:** The worktree commands in `CLAUDE.md` and `AGENTS.md` mention the original author's Convex team and deployments. Use your own deployment from step 4.

---

## Set it up with an AI coding agent

Copy this prompt into your coding agent (Claude Code, Cursor, Codex, Copilot, Windsurf…) from an empty folder. It will do the setup and stop to ask you for anything only you can do, such as creating accounts and pasting keys.

```text
You are setting up "Interflect", a Next.js 16 + Convex + Clerk learning platform, on my machine.
Repository: https://github.com/dev-ted/interflect.git

Work through these steps in order. After each step, tell me in one short line what you did and
whether it worked. Stop and ask me whenever you need something only I can do (creating accounts,
clicking in a dashboard, pasting keys). Never print, log or commit secret values, and never
commit .env.local.

1. Check prerequisites: Node.js >= 20.9 (`node -v`), git, and corepack. If something is missing,
   tell me how to install it for my OS and wait.
2. Clone the repo, cd into it, run `corepack enable` and `pnpm install`.
3. Read README.md fully. It is the source of truth for the remaining steps; follow it if anything
   here disagrees.
4. Clerk: walk me through the Clerk dashboard one item at a time and wait for me after each:
   a) create an application and give you the Publishable key and Secret key
      (I may paste them, or put them in .env.local myself);
   b) turn on Integrations → Convex;
   c) Sessions → Customize session token → set {"metadata": "{{user.public_metadata}}"};
   d) tell you the Frontend API URL (https://<something>.clerk.accounts.dev).
5. Create .env.local from .env.example and fill in the Clerk values and the four
   NEXT_PUBLIC_CLERK_* redirect URLs exactly as shown in README.md. Leave the Convex
   variables for the next step. Leave Mux and AI keys empty unless I provide them.
6. Run `npx convex dev --once` (I may need to sign in to Convex in the browser), then
   `npx convex env set CLERK_JWT_ISSUER_DOMAIN <my Frontend API URL>`, then
   `npx convex dev --once` again. Confirm .env.local now has NEXT_PUBLIC_CONVEX_URL.
7. Seed sample data: `npx convex run seed:seedCourses`.
8. Start the app with `pnpm dev` in the background, and confirm http://localhost:3000 and
   http://localhost:3000/courses respond (courses should list 4 items).
9. Ask me to sign up in the app, then guide me to set Public metadata {"role": "admin"} on my
   user in Clerk, sign out and back in, and confirm /admin opens.
10. Finish with a short summary: what is running, the URLs to open, which optional features are
    off (PRO_ENABLED and TUTOR_ENABLED in convex/lib/features.ts, Mux, AI Gateway) and exactly
    what I'd need to turn each on. If any step failed, use the Troubleshooting table in
    README.md before asking me.
```
