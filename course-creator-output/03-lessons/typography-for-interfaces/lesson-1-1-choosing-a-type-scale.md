# LESSON SCRIPT: Building a type system — Choosing a type scale

## Metadata
- **Course:** Typography for interfaces (`typography-for-interfaces`)
- **Duration:** 2 minutes 59 seconds (387 spoken words at 130 per minute = 179 seconds). Narration-only cut: 350 words, 162 seconds. No pause time is added for code on screen.
- **Content type:** Screencast with voiceover.
- **Learning objective:** Build a small modular scale, name its steps by role, and stop inventing font sizes.
- **Materials:** A modal before/after, the custom properties below.
- **Source:** Seeded lesson `choosing-a-type-scale`.

## Hook (28 seconds)

**On screen:** A stylesheet search highlighting many font sizes a pixel apart: 13, 14, 15, 16, 17, 18. A counter reads “15 sizes”.

**Say:**

Most interfaces need far fewer font sizes than they use. An audit of a mature product often finds fifteen or more sizes, many of them a pixel apart. A type scale replaces that drift with a short, deliberate list. You will pick a base and a ratio, name the steps by role, and apply three of them to a modal.

## Core teaching (56 seconds)

**On screen:** A ladder. Base 16. Multiply by 1.25. Steps appear: about 13, 16, 20, 25, 31, 39. Then they snap to whole pixels.

**Say:**

A modular scale multiplies a base size by a ratio. With a 16 pixel base and a ratio of 1.25 you get roughly 12.8, 16, 20, 25, 31, and 39. Round those to whole pixels and you have a scale.

**On screen:** Three example headlines at the same base, different ratios. Labels: 1.125 to 1.2 compact. 1.25 balanced. 1.333 and up dramatic.

**Say:**

The ratio guides the feel. From 1.125 to 1.2 is compact, good for dense dashboards and tools. 1.25 is a balanced default for most products. 1.333 and up is dramatic, better suited to marketing pages with big headlines. You can use a tighter ratio inside the app and a larger one for marketing, as long as they share the same base.

**On screen:** Two token lists. Left, crossed out: `--text-20`, with a ghost `--text-21` trying to appear. Right: caption, body, lead, title, display.

**Say:**

Name steps by role, not by size. Names like text-20 invite people to add text-21. Role names keep the list closed.

## Demo / walkthrough (1 minute 8 seconds)

**On screen:** The custom properties. Point at the rem values and the pixel comments.

```css
:root {
  --text-caption: 0.75rem;   /* 12px */
  --text-body: 1rem;         /* 16px */
  --text-lead: 1.25rem;      /* 20px */
  --text-title: 1.5625rem;   /* 25px */
  --text-display: 2.4375rem; /* 39px */
}
```

**Say:**

Five steps: caption, body, lead, title, display. Use rem so the scale follows the reader’s browser font size. People who set a larger default are often the ones who need it most. If someone sets their root to 20 pixels, every step grows with them.

**On screen:** A modal. Before: body 15px, title 17px, helper 13px. The three sizes look almost the same. After: title uses `--text-title`, content uses `--text-body`, helper uses `--text-caption`. The jump is obvious.

**Say:**

Before, a modal used 15 pixels for body, 17 for the title, and 13 for helper text, chosen one at a time over several sprints. Nothing reads as a decision. After, the modal uses three steps from the scale. Title, body, caption. The title is clearly a title. The helper is clearly secondary, instead of almost the same size as the body.

**On screen:** A marketing H1 with the clamp rule. Resize the window: the heading grows, body text stays put. Highlight the clamp line.

```css
h1 {
  font-size: clamp(2rem, 1.5rem + 2vw, 3rem);
}
```

**Say:**

For large display text you can let the size grow with the viewport. Clamp between 2 rem and 3 rem. Keep body text fixed. Fluid body sizes make line length and spacing harder to reason about, and the gain is small.

## Activity

Audit one screen and list every font-size. Collapse them onto five or six role tokens. Rename any size-based token to a role. You know you have it when a new size would have to justify a new role, not a new pixel. Stretch: set the browser default font larger and confirm the rem scale follows it.

## Recap + bridge (26 seconds)

**On screen:** Three lines: Base and ratio, five or six steps. Name by role. rem for text, fluid only for display.

**Say:**

Pick a base and a ratio, round the results, and commit to five or six steps. Name steps by role so the list stays short. Use rem, and reserve fluid sizing for display text. Next: a good size can still be tiring to read if the line is too long or the line height does not match.

## Companion materials
- Scale worksheet: base, ratio, five rounded steps, role names.
- Modal before/after snippet.

## Narration only (paste into a voice generator)

Most interfaces need far fewer font sizes than they use. An audit of a mature product often finds fifteen or more sizes, many of them a pixel apart. A type scale replaces that drift with a short, deliberate list. You will pick a base and a ratio, name the steps by role, and apply three of them to a modal.

A modular scale multiplies a base size by a ratio. With a 16 pixel base and a ratio of 1.25 you get roughly 12.8, 16, 20, 25, 31, and 39. Round those to whole pixels and you have a scale.

The ratio guides the feel. From 1.125 to 1.2 is compact, good for dense dashboards and tools. 1.25 is a balanced default for most products. 1.333 and up is dramatic, better suited to marketing pages with big headlines. You can use a tighter ratio inside the app and a larger one for marketing, as long as they share the same base.

Name steps by role, not by size. Names like text-20 invite people to add text-21. Role names keep the list closed. Five steps: caption, body, lead, title, display. Use rem so the scale follows the reader’s browser font size. People who set a larger default are often the ones who need it most.

Before, a modal used 15 pixels for body, 17 for the title, and 13 for helper text, chosen one at a time over several sprints. After, the modal uses three steps from the scale. The title is clearly a title. The helper is clearly secondary.

For large display text you can let the size grow with the viewport. Keep body text fixed. Fluid body sizes make line length and spacing harder to reason about, and the gain is small.

Pick a base and a ratio, round the results, and commit to five or six steps. Name steps by role so the list stays short. Use rem, and reserve fluid sizing for display text. Next: a good size can still be tiring to read if the line is too long or the line height does not match.
