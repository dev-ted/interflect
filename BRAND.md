# Vukora brand

The living version is at `/brand`, rendered from the real tokens in `app/globals.css`.

## Idea
*Vuka* is isiZulu and isiXhosa for wake up, or rise. Learning is waking up. Day (light) and night (dark) modes, toggled with `data-color-scheme` on `<html>`. The gold sun is the only loud thing on a page: logo, progress, Pro, and one highlight per view.

## Logo
- Mark: a thick rounded V in Vuka Blue (`--primary`) cradling a sun disc (`--sun`). Wordmark: lowercase "vukora", Schibsted Grotesk 800.
- Components: `Logo` (lockup), `LogoMark` (mark), both take `mono` to draw in `currentColor`.
- Clear space equals the sun's diameter. Minimum 16px for the mark, 96px wide for the lockup.
- Never recolour the sun, stretch the mark or set the wordmark in capitals.

## Colour
Use the utilities (`bg-surface`, `text-mist`, `border-line`, ...). They swap per theme, so `dark:` is almost never needed. Wrap a region in `className="night"` to render it on the night palette in both modes.

| Token | Day | Night | Use |
|---|---|---|---|
| `bg` | `#F6F7FB` | `#0B1033` | Page |
| `surface` | `#FFFFFF` | `#131A45` | Cards, panels |
| `subtle` | `#EEF0F7` | `#1A2255` | Tracks, hovers, chips |
| `ink` | `#0F1436` | `#EEF0FA` | Text |
| `mist` | `#5B6283` | `#A3A9C9` | Secondary text |
| `line` | `#E3E6F0` | `#252D5E` | Borders |
| `primary` | `#2F45E0` | `#7C8CFF` | Actions, links |
| `sun` | `#FFB52E` | `#FFC24D` | Logo sun, progress, Pro |
| `sage` | `#3F8F6B` | `#5FC096` | Completed, correct |
| `danger` | `#D93D42` | `#FF6B6F` | Errors |

## Type
Schibsted Grotesk for everything; JetBrains Mono (`font-mono`) for code only. Headings 700 to 800 at -0.02em, body 400 to 500. Major third scale: 12, 14, 16, 20, 25, 31, 39, 49, 61px. Lines under 70ch.

## Shape and components
- Radius by hierarchy: 6px controls (`rounded-md`), 12px cards (`.card`, `rounded-xl`), 24px hero panels only (`rounded-3xl`), `rounded-full` for chips and avatars.
- Primitives: `.btn` with `.btn-primary | .btn-secondary | .btn-ghost | .btn-sun`, sizes `.btn-sm | .btn-lg | .btn-icon`; `.card`; `.chip`; `.field`.
- Day uses one soft tinted shadow (`shadow-card`); night uses lighter surfaces and no shadow. No hard offset shadows.
- Interactive primitives come from `@ui-sdk/react`, one entry per component.

## Motion
- Only transform and opacity. `--ease-out` cubic-bezier(0.23, 1, 0.32, 1), `--ease-in-out` cubic-bezier(0.77, 0, 0.175, 1).
- 160ms presses and colour, 220ms popovers, 320ms max in the UI.
- Buttons press to 0.97. Popups scale from 0.95 with opacity from `--transform-origin`, never from 0.
- Hover effects only under `(hover: hover) and (pointer: fine)`.
- One signature moment: `.sun-rise`, the sun rising behind the landing hero once (900ms). Nothing else moves on its own. Reduced motion turns everything into a fade.

## Voice
Plain, sentence case, active verbs.

| Write | Not |
|---|---|
| Start learning | Get Started Now → |
| Mark complete | LESSON COMPLETED! |
| 12 lessons in 3 modules | 10,000+ happy learners |
| Video, notes and a quiz in every lesson | Video · Notes · Quizzes |

No all-caps eyebrows, no middle-dot strings, no arrows on links, no emoji, no numbers we cannot back with real data.
