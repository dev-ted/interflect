# Learnly Studio: Setup & Architecture Guide

## 1. What it is

**Learnly Studio** is an online course platform (an LMS, or learning management system). Students browse courses, watch video lessons, read lesson notes, take quizzes and track their progress. Paying "Pro" members get the locked courses and an AI tutor. One admin account manages all the content.

**What it's built with:**

| Layer | Tool | Job |
|---|---|---|
| Frontend | **Next.js 16** + React 19, Tailwind 4 | Pages and UI |
| UI components | **@ui-sdk/react** (Vercel Labs) | Accessible dialogs, toasts, tabs, etc. |
| Backend and database | **Convex** | Data, queries, mutations; pages update live |
| Sign-in and payments | **Clerk** (Auth + Billing) | Login, Pro subscription, admin role |
| Video | **Mux** + Video.js 10 | Hosting and playing lesson videos |
| AI tutor | **Vercel AI SDK** via AI Gateway (Claude Sonnet 5) | The "Learnly" chat widget |
| Agent (separate) | **Vercel Eve** in `agents/learnly/` | A standalone version of the tutor |

---

## 2. Pages

| URL | What it does | Who can see it |
|---|---|---|
| `/` | Landing page: hero, featured courses, sections | Everyone |
| `/courses` | Course catalog with filters | Everyone |
| `/courses/[slug]` | Course detail: modules, lessons, Enroll button | Everyone |
| `/courses/[slug]/lessons/[lessonSlug]` | Video player, Markdown notes, quiz, mark complete | Depends on the lesson (see §4) |
| `/pricing` | Pro plan with Clerk `CheckoutButton` | Everyone |
| `/dashboard` | Your enrolled courses, progress, quiz history | Signed-in users |
| `/admin` | Content studio: courses, modules, lessons, video uploads, quizzes | Admin only |
| `/sign-in`, `/sign-up` | Clerk's built-in sign-in and sign-up screens | Everyone |

**API routes, in `app/api/`:**
- `POST /api/learnly/chat`: the AI tutor's endpoint.
- `POST /api/mux/upload`: gets a Mux upload URL (admin only).
- `GET /api/mux/upload/[uploadId]`: checks whether an uploaded video has finished processing (admin only).

---

## 3. The database ([convex/schema.ts](convex/schema.ts))

Content is nested three levels: **courses → modules → lessons**.

| Table | What it holds |
|---|---|
| `courses` | Title, slug, tier (`free`/`pro`), level, published flag, featured flag, tags, display order |
| `modules` | Sections inside a course, in order |
| `lessons` | Markdown content, Mux video IDs and status, `isFreePreview`, optional quiz questions |
| `enrollments` | Which user has enrolled in which course |
| `lessonProgress` | Which lessons each user has completed |
| `quizAttempts` | Each quiz attempt: score and answers |

**Backend functions:**
- [convex/courses.ts](convex/courses.ts): public reads (`listPublished`, `getCourseBySlug`, `getLessonBySlug`, `getCatalogSnapshot`) and admin create/read/update/delete for courses, modules and lessons. The admin functions call `requireAdmin`.
- [convex/enrollments.ts](convex/enrollments.ts): `enroll`, `unenroll`, `toggleLessonComplete`, `recordQuizAttempt`, `getMyLearningDashboard`, `getUserProgressForAgent`.
- [convex/seed.ts](convex/seed.ts): loads **4 sample courses** with lessons, quizzes and a demo Mux video. Running it again skips any course whose slug already exists.

---

## 4. How access control works

There are three kinds of user.

**1. Free user (signed in or not)**
- Can see free-tier courses in full.
- Can see lessons marked `isFreePreview` inside Pro courses.

**2. Pro user** (has bought the Clerk plan `pro`)
- Gets every lesson plus the AI tutor.
- The app treats you as Pro if any of these is true:
  - your plan is `pro`
  - you have the feature `pro_courses`
  - you have the feature `learnly_ai`

**3. Admin** (`publicMetadata.role = "admin"` in Clerk)
- Everything Pro gets, plus `/admin`.

**Locking is done on the server.** In `getLessonBySlug` ([convex/courses.ts](convex/courses.ts)):

```ts
canAccess = course.tier === "free" || lesson.isFreePreview || hasProAccess
```

If `canAccess` is false, Convex sends back an empty video ID, empty notes and an empty quiz, plus `isLocked: true`. The UI just shows a lock, so nobody can get locked content by tweaking the browser.

**The same check runs in three places:**
- [lib/server-auth.ts](lib/server-auth.ts): Next.js server pages and API routes, using Clerk's `has()`
- [convex/lib/auth.ts](convex/lib/auth.ts): inside Convex, reading the claims in the JWT (`pla` for plans, `fea` for features, `metadata.role`)
- [agents/learnly/agent/channels/eve.ts](agents/learnly/agent/channels/eve.ts): the Eve agent

**How sign-in reaches Convex:** [components/ConvexClientProvider.tsx](components/ConvexClientProvider.tsx) passes Clerk's token to Convex. It uses a custom bridge instead of the stock `ConvexProviderWithClerk`. Without that, someone who just upgraded to Pro would still look "free" to Convex until they refreshed the page.

---

## 5. Features in more detail

**Video (Mux)**
1. In the admin lesson editor, `MuxUploader` asks `/api/mux/upload` for an upload URL.
2. The browser uploads the file straight to Mux.
3. The editor checks `/api/mux/upload/[id]` until the video's status is `ready`.
4. The lesson saves the `muxPlaybackId`, and students watch through `MuxVideoPlayer`.

The seeded lessons use a public demo playback ID, so **video works without Mux keys**. You only need the keys to upload your own videos.

**AI tutor (Learnly widget)**
1. The floating widget (`components/learnly/LearnlyWidget.tsx`) is on every page.
2. It sends your messages plus the page you're on (course, lesson) to `/api/learnly/chat`. The page info comes from `PageContextProvider`.
3. That route checks you're Pro, then calls the model with `generateText`. The model defaults to `anthropic/claude-sonnet-5`; set `LEARNLY_MODEL` to change it.
4. The model has 4 tools: list courses, get lesson content, get your progress, and create an interactive quiz. Quizzes appear as clickable cards.
5. **Fallback:** if there's no AI key, or the call fails, the route answers with canned replies built from your Convex data instead of crashing.

**The Eve agent (`agents/learnly/`)** is a second, standalone copy of the same tutor, with the same 4 tools and its own `instructions.md`. **The website does not use it**; the widget talks to `/api/learnly/chat`. Run it on its own with `pnpm eve:dev`.

**Billing:** `/pricing` uses Clerk's `CheckoutButton` with `NEXT_PUBLIC_CLERK_PRO_PLAN_ID`. Clerk handles the payment. After checkout, the app reloads your session so the Pro unlock shows straight away.

**Admin studio:** create, edit and delete courses, modules and lessons. You can write Markdown notes, build quizzes, upload video and toggle published/featured. A **"Seed sample courses"** button fills in demo content.

**Other config ([next.config.mjs](next.config.mjs)):** Cache Components, partial prefetching and the React Compiler are switched on. Remote images are allowed from Unsplash, Mux and Clerk. [proxy.ts](proxy.ts) is Next 16's replacement for `middleware.ts` and runs Clerk on every request.

---

## 6. Getting it running

### Step 1: Install dependencies
The project pins pnpm 11.

```bash
corepack enable && pnpm install
```

### Step 2: Set up Clerk (dashboard.clerk.com)
1. Create an application. Copy the **Publishable key** and **Secret key**.
2. **Connect Clerk to Convex.** Go to Clerk's Integrations page and turn on Convex. That adds `"aud": "convex"` to the session token. (Creating a JWT template named `convex` also works; the code accepts either.)
3. **Customize the session token** (Sessions → Customize session token) so admin detection works:
   ```json
   { "metadata": "{{user.public_metadata}}" }
   ```
   Without this, the server and Convex can't see `role: "admin"`, and `/admin` stays locked even after you set the role.
4. **Billing:**
   - Turn on Billing.
   - Create a plan with slug **`pro`**.
   - Optionally add the features `pro_courses` and `learnly_ai`.
   - Copy the plan ID (`cplan_…`).
5. Note your **Frontend API URL** (looks like `https://xxx.clerk.accounts.dev`). Convex needs it.

### Step 3: Create `.env.local`
Copy `.env.example` and fill it in:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_PRO_PLAN_ID=cplan_...

# Optional: only needed to upload your own videos
MUX_TOKEN_ID=...
MUX_TOKEN_SECRET=...

# Optional: real AI answers (otherwise you get the canned fallback)
AI_GATEWAY_API_KEY=...

# CONVEX_DEPLOYMENT / NEXT_PUBLIC_CONVEX_URL / NEXT_PUBLIC_CONVEX_SITE_URL
# are written for you by `npx convex dev` in the next step
```

### Step 4: Set up Convex
This logs you in, creates your own dev deployment and writes the Convex URLs into `.env.local`:

```bash
npx convex dev --once
```

Then tell Convex which Clerk app to trust. This goes in **Convex's environment, not `.env.local`**:

```bash
npx convex env set CLERK_JWT_ISSUER_DOMAIN https://YOUR-APP.clerk.accounts.dev
```

### Step 5: Load the sample courses

```bash
npx convex run seed:seedCourses
```

### Step 6: Start the app
This starts Next.js and Convex together:

```bash
pnpm dev
```

Open http://localhost:3000.

### Step 7: Make yourself admin
1. Sign up in the app.
2. In the Clerk dashboard, go to Users → your user → **Public metadata** and set:
   ```json
   { "role": "admin" }
   ```
3. Sign out and back in. `/admin` now works, and admin also counts as Pro, so the AI tutor unlocks too.

---

## 7. Things to watch out for

- **The worktree setup commands in CLAUDE.md and AGENTS.md point at the original author's accounts.** They name a Convex team (`sonny-sangha-a0b7d`), a deployment (`artful-rhinoceros-303`) and a Clerk domain (`splendid-vervet-7893`). You almost certainly can't use those. Use your own deployment from Step 4.
- **The AI tutor needs a Gateway key, not an Anthropic key.** The model is given as a plain string (`"anthropic/claude-sonnet-5"`), which goes through Vercel's AI Gateway. The code lists `ANTHROPIC_API_KEY` as acceptable, but that key alone probably won't make the call work, and you'll quietly get the canned fallback. Use `AI_GATEWAY_API_KEY`, or run `vercel env pull` to get an OIDC token.
- **Pricing button needs a real plan ID.** If `NEXT_PUBLIC_CLERK_PRO_PLAN_ID` isn't set, it falls back to a hardcoded plan ID from the original author, and checkout will fail.
- **The tutor's name and bio are hardcoded.** "Sonny Sangha" is set in `lib/auth.ts` (`TUTOR`) and in the seed data. Change both if this is your own platform.
