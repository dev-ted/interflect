# Interflect brand guidelines

**Interflect** = *interface* + *reflection*: looking past the surface of a design to understand why it works.
**Tagline:** Think better. Design better.

The live, theme-aware version of this guide is at `/brand`. Tokens live in `app/globals.css`, the logo in `components/brand/Logo.tsx`.

## Logo
- **Symbol:** two 6×12 bars, radius 3, on a 24px grid. The ink bar is the "I", the interface. The teal bar is its reflection, offset half a bar down. Together they stand for design thinking and implementation.
- **Wordmark:** "interflect", lowercase, Instrument Sans semibold, tracking −0.03em.
- **Variants:**
  - Lockup (symbol + wordmark)
  - Symbol
  - Mono (both bars in one colour, the reflection at 45%)
  - Favicon (`app/icon.svg`: the symbol on an ink tile)
- **Clear space:** one bar width (x) on every side.
- **Minimum size:** 16px for the symbol, 88px for the lockup.
- **Don't:**
  - colour both bars teal
  - stretch or squash
  - flip the reflection upward
  - add shadows, gradients or outlines

## Colour
| Name | Token | Light | Dark | RGB (light) | Use |
|---|---|---|---|---|---|
| Ink | `--ink` | #171717 | #FAFAFA | 23 23 23 | Text, primary buttons (17.9:1 on white) |
| Paper | `--bg` | #FFFFFF | #0A0A0A | 255 255 255 | Page |
| Surface | `--surface` | #FFFFFF | #171717 | 255 255 255 | Cards |
| Subtle | `--subtle` | #F5F5F5 | #262626 | 245 245 245 | Muted fills |
| Mist | `--mist` | #737373 | #A3A3A3 | 115 115 115 | Secondary text (4.7:1, AA) |
| Line | `--line` | #E5E5E5 | white 10% | 229 229 229 | Borders, grid |
| Reflect teal | `--accent` | #14B8A6 | #2DD4BF | 20 184 166 | Fills, focus, progress, symbol (graphics only on light: 2.5:1) |
| Teal text | `--accent-ink` | #0F766E | #2DD4BF | 15 118 110 | Links and accent text (5.5:1, AA) |
| Coral | `--coral` | #F25F5C | #FF7A78 | 242 95 92 | Rare highlights and redlines; never body text |
| Success | `--success` | #16A34A | #4ADE80 | 22 163 74 | Status |
| Warning | `--warning` | #D97706 | #FBBF24 | 217 119 6 | Status |
| Danger | `--danger` | #DC2626 | #F87171 | 220 38 38 | Status |

**Proportion:** about 90% neutrals, 8% ink, 2% teal. Coral appears at most once per screen.

## Typography
- **Instrument Sans** for UI and headings. **JetBrains Mono** only for code and measurements.
- **Scale:**

  | Role | Size | Weight | Tracking |
  |---|---|---|---|
  | Display | 72 | 600 | −0.045em |
  | H1 | 56 | 600 | −0.04em |
  | H2 | 40 | 600 | −0.035em |
  | H3 | 24 | 600 | −0.03em |
  | Body large | 18 | 400 | normal |
  | Body | 16 | 400 | normal |
  | Small | 14 | 400 | normal |
  | Label | 12 | 500 | normal |

- **Body text:** line height 1.6, at most 65 characters per line.

## Shape and depth
- **Radius:** `--radius` is 0.625rem.
  - Buttons are pills.
  - Fields are 10px.
  - Cards are 14px.
  - Showcase panels are 20px.
- **Depth:** a 1px line plus one soft shadow in light mode; lighter surfaces in dark mode.

## Graphic language
- **Grid:** a quiet 24px layout grid.
- **Guides and redlines:** alignment guides, and spacing redlines with mono labels (8, 16, 24).
- **Layers:** panels layered one step of depth at a time.
- **Purpose:** these elements show the structure behind the surface.

## Icons and imagery
- **Icons:** Lucide at 16, 20 or 24px, stroke 1.5–2, in ink or mist.
- **Course art:** abstract interface compositions on the grid with a single accent.
- **Photography:** real people at real work, natural light, screens visible.
- **Avoid:** books, lightbulbs, graduation caps and posed stock photos.

## UI
- One primary action per view.
- **Buttons:** primary (ink pill), secondary (outlined pill), ghost, and accent (teal, used rarely).
- **Badges:** neutral chips. The Pro badge is a teal tint.

## Social
- **Avatar:** the symbol on ink, 400×400.
- **Cover:** 1500×500, with the lockup and tagline left-aligned on the grid.

## Motion
- **Easing:**
  - `--ease-out` cubic-bezier(.23, 1, .32, 1) for entering and responding
  - `--ease-in-out` cubic-bezier(.77, 0, .175, 1) for movement on screen
- **Timing:** 150–250ms for UI. Buttons press to 0.97, and popovers scale from their trigger starting at 0.95.
- **Signature:** the before/after critique slider sweeps once on the home page. Nothing else animates on its own.
- **Reduced motion:** transitions fall back to opacity only.

## Voice
A knowledgeable designer who enjoys sharing what they know: clear, practical, curious, confident without condescension.
- **Do:**
  - "Learn why the layout works, then build it."
  - "Save changes."
  - "Contrast is 2.1:1. Use mist on white for 4.7:1."
- **Don't:**
  - hype ("Unlock your creative superpowers!")
  - all caps
  - vague errors ("Oops!")
  - invented stats or logos
