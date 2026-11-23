# LESSON SCRIPT: Layout that holds — Grids and alignment

## Metadata
- **Course:** Visual hierarchy & layout (`visual-hierarchy-and-layout`)
- **Duration:** 3 minutes 35 seconds (466 spoken words at 130 per minute = 215 seconds). Narration-only cut: 334 words, 154 seconds. No pause time is added for code on screen.
- **Content type:** Screencast with voiceover.
- **Learning objective:** Use a simple column grid and shared alignment edges so layouts look intentional at every width.
- **Materials:** A dashboard wireframe, a profile header, the CSS below.
- **Source:** Seeded lesson `grids-and-alignment`.
- **Previous lesson:** Spacing on an 8 point scale.

## Hook (23 seconds)

**On screen:** A busy dashboard. Seven vertical guides mark different left edges. Then the same dashboard with two shared edges, and the guides collapse.

**Say:**

A grid is not decoration. It is a promise that things which look aligned really are aligned, at every screen width, and with every length of content. Count the distinct left edges on a screen. Reducing them is often the single biggest improvement you can make to a busy layout.

## Core teaching (43 seconds)

**On screen:** The dashboard labelled: heading, filter bar, three cards, table. Each has its own left edge. A counter reads “7 edges”. Then two guides remain and the counter reads “2”.

**Say:**

A dashboard with a heading, a filter bar, three cards, and a table might have seven different left edges if each was placed by eye. Each edge is a small visual event. Reducing them to two or three calms the screen more than a new colour or a new typeface.

**On screen:** A 12-column overlay. Three layouts light up: full width, 8 plus 4, three equal cards of 4.

**Say:**

Twelve columns divide neatly into halves, thirds, quarters, and sixths, which is why the number is so common. You do not need to use all twelve. Most product screens use a few spans: full width, two thirds plus one third, or three equal cards.

## Demo / walkthrough (1 minute 57 seconds)

**On screen:** Code, then a page at 1200px with main and aside. Resize the viewport under 768px and both stack.

```css
.page {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 24px;
  max-width: 1200px;
  margin-inline: auto;
  padding-inline: 16px;
}

.main { grid-column: span 8; }
.aside { grid-column: span 4; }

@media (max-width: 768px) {
  .main,
  .aside { grid-column: 1 / -1; }
}
```

**Say:**

The page is a 12 column grid, gap 24, which is on the spacing scale from the last lesson. Max width 1200, centred, with 16 pixels of inline padding. Main spans 8. The aside spans 4. Below 768 pixels both span the full grid, from line 1 to the last line.

**On screen:** Split view. Left: `repeat(12, 1fr)` with a long unbroken URL forcing one column wider. Right: `minmax(0, 1fr)` and the columns stay even. Highlight `minmax(0, 1fr)`.

**Say:**

Use minmax 0, 1fr, not plain 1fr. Without the zero minimum, a long URL or a code block inside a column can force that column wider than its share and break the grid. 1fr has an automatic minimum based on content. minmax of 0 and 1fr lets the column shrink so the grid stays even.

**On screen:** Profile header, before: avatar, name, and button each centred in their own box. The button sits a few pixels lower than the name. A baseline guide is crooked.

**Say:**

Before: a profile header where the avatar, the name, and the action button are each centred in their own flex box. Text baselines do not line up, and the button floats a few pixels lower than the name.

**On screen:** After CSS. A single baseline runs through the name and the button label. Avatar is centred against the row.

```css
.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.profile-header .meta {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex: 1;
}
```

**Say:**

After: one row with align-items center for the avatar, and a shared baseline for the name and the button text. Gap 16 between avatar and text, gap 8 inside the meta row. The name and the button label now sit on the same invisible line, which is what the eye checks first.

**On screen:** A play icon mathematically centred in a circle, looking left-heavy. Nudge it a pixel or two to the right. A comment appears in the CSS: “optical nudge, visual weight sits left”.

**Say:**

Sometimes mathematically aligned things look wrong. A play icon centred in a circle looks shifted left because its visual weight sits on one side. Round shapes look smaller than squares of the same size. Nudge these by a pixel or two. Align to what people see, then leave a comment so the next person does not undo it.

## Activity

Open one busy screen and count distinct left edges. Share edges until you are down to two or three. Put the main regions on a 12 column grid with minmax 0, 1fr. You know you have it when resizing and changing a title’s length does not create a new edge. Stretch: find one icon that is mathematically centred and optically wrong, nudge it, and leave the comment.

## Recap + bridge (31 seconds)

**On screen:** Three lines: Fewer edges. A few spans, minmax 0 1fr. Baselines for text, eye for icons.

**Say:**

Count the left edges and remove the ones you did not mean to create. Use a column grid with a small set of spans, and minmax 0, 1fr to keep columns honest. Align text on baselines, and trust your eye for icons and round shapes. The next course takes the same discipline into type: a short scale of sizes, named by role, so you stop inventing font sizes.

## Companion materials
- 12-column overlay (full, 8/4, three equal).
- Snippet: page grid and profile header.

## Narration only (paste into a voice generator)

A grid is not decoration. It is a promise that things which look aligned really are aligned, at every screen width, and with every length of content. Count the distinct left edges on a screen. Reducing them is often the single biggest improvement you can make to a busy layout.

A dashboard with a heading, a filter bar, three cards, and a table might have seven different left edges if each was placed by eye. Each edge is a small visual event. Reducing them to two or three calms the screen more than a new colour or a new typeface.

Twelve columns divide neatly into halves, thirds, quarters, and sixths. You do not need to use all twelve. Most product screens use a few spans: full width, two thirds plus one third, or three equal cards.

The page is a 12 column grid, gap 24. Max width 1200, centred, with 16 pixels of inline padding. Main spans 8. The aside spans 4. Below 768 pixels both span the full grid.

Use minmax 0, 1fr, not plain 1fr. Without the zero minimum, a long URL or a code block inside a column can force that column wider than its share and break the grid.

Before, a profile header centred the avatar, the name, and the button in their own boxes. Baselines did not line up. After, one row centres the avatar, and the name and button text share a baseline. The eye checks that invisible line first.

Sometimes mathematically aligned things look wrong. A play icon centred in a circle looks shifted left because its visual weight sits on one side. Nudge it by a pixel or two, and leave a comment so the next person does not undo it.

Count the left edges and remove the ones you did not mean to create. Use a column grid with a small set of spans, and minmax 0, 1fr to keep columns honest. Align text on baselines, and trust your eye for icons and round shapes.
