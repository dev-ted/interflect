<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->

<!-- ui-sdk-start -->

## UI SDK (`@ui-sdk/react`, `@ui-sdk/core`)

This project uses [Vercel Labs UI SDK](https://github.com/vercel-labs/ui) (`@ui-sdk/react` and `@ui-sdk/core`) for interactive UI components and behaviors.

Whenever building or modifying UI in this repo:
- Always follow the installed `ui-sdk` skill (`~/.agents/skills/ui-sdk/SKILL.md`) and read the local package docs starting at `node_modules/@ui-sdk/react/docs/llms.txt` before writing component code.
- Import each component from its own entry (e.g., `@ui-sdk/react/select`, `@ui-sdk/react/dialog`), never from a package root or `@ui-sdk/core/internal/*`.
- Never hand-roll accessible primitives (`role="dialog"`, `"menu"`, `"listbox"`, `"tablist"`, `"switch"`, `"slider"`, `"radiogroup"`, `"toolbar"`, `"tree"`, etc.) when `@ui-sdk/react` ships the component, or build custom behaviors from `@ui-sdk/core`.
- Keep `@layer ui-sdk;` at the top of `app/globals.css` above `@import "tailwindcss";`.
- Style from `data-slot`, state attributes (`data-open`, `data-pressed`, etc.), and component CSS variables; change rendered elements with `render`, never `as`.
- Label every interactive control and follow the `ui-sdk` testing and agent-ready guidelines.

<!-- ui-sdk-end -->

<!-- modern-web-guidance-start -->

## Modern Web Guidance (`GoogleChrome/modern-web-guidance`)

Follow the installed `modern-web-guidance` skill (`~/.agents/skills/modern-web-guidance/SKILL.md`) for modern browser APIs, performance, accessibility, and web platform best practices when building features in this app.

<!-- modern-web-guidance-end -->

<!-- eve-start -->

## Vercel Eve (`eve`)

This project uses the [Vercel Eve](https://github.com/vercel/eve) multi-agent workspace under `agents/` (starting with `agents/learnly/`).

Whenever creating, editing, or debugging Eve agents:
- Always read the bundled docs starting at `node_modules/eve/docs/README.md` before writing agent code.
- Inside any `defineDynamic` function, wrap every network request, database query, API call, and sandbox read in `ctx.memo(key, fn)` because `defineDynamic` runs before every model call.

<!-- eve-end -->
