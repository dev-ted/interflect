# LESSON SCRIPT: Reading order — Spacing on an 8 point scale

## Metadata
- **Course:** Visual hierarchy & layout (`visual-hierarchy-and-layout`)
- **Duration:** 3 minutes 37 seconds (470 spoken words at 130 per minute = 217 seconds). Narration-only cut: 450 words, 208 seconds. No pause time is added for code on screen.
- **Content type:** Screencast with voiceover.
- **Learning objective:** Replace ad hoc margins with a short spacing scale, and use proximity to group related things.
- **Materials:** A settings form, the before/after CSS below.
- **Source:** Seeded lesson `spacing-on-an-8-point-scale`.
- **Previous lesson:** Hierarchy is a reading order.
- **Next lesson:** Grids and alignment.

## Hook (24 seconds)

**On screen:** A settings screen with many slightly different gaps. Callouts show 13px, 5px, 18px, 22px.

**Say:**

Spacing is the quietest part of a layout and the easiest to get wrong. Most messy interfaces are not badly coloured or badly typeset. They have twenty slightly different gaps that nobody chose. In this lesson you will group with proximity, pick an 8 point scale, and let the parent own the gaps.

## Core teaching (1 minute 7 seconds)

**On screen:** A form. First version: label 16px above its input and 16px below the previous input, with a question mark between the two fields. Second version: 8px between label and input, 24px between fields.

**Say:**

People assume that things close together belong together. The space between groups must be clearly larger than the space within a group. A form label that sits 16 pixels above its input and 16 pixels below the previous input is ambiguous. Which field does it belong to?

A reliable rule: the gap between groups should be at least twice the gap inside a group.

**On screen:** The scale as a row of blocks: 4, 8, 12, 16, 24, 32, 48, 64. The 4 block is labelled “icon and label”.

**Say:**

An 8 point scale gives you a short menu: 4, 8, 12, 16, 24, 32, 48, 64. The 4 is for tight details, like the gap between an icon and its label. Everything else steps up in a way that is easy to see.

The value of a scale is not the number 8. It is that decisions become choices from a list rather than guesses, and that two people working on the same screen end up with the same answer.

## Demo / walkthrough (1 minute 41 seconds)

**On screen:** The before CSS, then a settings row that looks slightly off.

```css
.row { padding: 13px 18px; }
.row h3 { margin-bottom: 5px; }
.row p { margin-bottom: 22px; }
```

**Say:**

This settings row collected margins over time. Thirteen, eighteen, five, twenty-two. None of those numbers were a decision you could defend. They are leftovers.

**On screen:** Token list, then the after layout. Highlight `gap` on `.row` and on `.settings`.

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-4: 16px;
  --space-6: 24px;
}

.row {
  display: grid;
  gap: var(--space-1);
  padding: var(--space-4) var(--space-6);
}

.settings {
  display: grid;
  gap: var(--space-6);
}
```

**Say:**

The row uses the scale, and the parent owns the spacing. Inside the row, a 4 pixel gap keeps the title and description together. The settings list uses a 24 pixel gap between rows, which is more than twice the gap inside a row, so each row reads as its own group. Padding is 16 and 24, both on the scale.

Using gap on the parent, instead of margins on the children, removes a whole class of bugs. No collapsing margins. No stray space after the last item. No need to remember which child carries the margin.

**On screen:** A diagram. A card labelled “component owns padding and internal gap”. A parent labelled “layout owns the gap between components”. A red cross on a component that sets its own margin.

**Say:**

Separate spacing into two kinds. Inside a component: padding and the gap between its own parts. The component owns this. Between components: the layout around it. The parent owns this. Components that set their own outer margins are hard to reuse, because every new context needs a different margin.

**On screen:** A redline overlay. Gaps annotated 8, 16, 24. One stray 22 is circled.

**Say:**

When you hand over a design or review a pull request, annotate gaps with their scale values: 8, 16, 24. If a number does not appear on the scale, it is either a bug or a sign the scale needs a new step. Both are worth a conversation.

## Activity

Pick one screen and list every distinct gap. Map each to the scale, or mark it as a candidate to delete. Rebuild the tightest group with `gap` on the parent. You know you have it when the space between groups is at least twice the space inside them, and every number is on the scale. Stretch: remove every margin from the children and put spacing only on parents.

## Recap + bridge (25 seconds)

**On screen:** Three lines: Between groups, at least twice the inside gap. Choose from the scale. Parents own `gap`.

**Say:**

Space between groups should be clearly larger than space within them. Choose values from a short scale rather than inventing new ones. Let parents own the gaps between children, using gap. Next we stop counting gaps and start counting edges: a simple column grid, and alignment that still holds when the words change length.

## Companion materials
- Spacing scale card: 4, 8, 12, 16, 24, 32, 48, 64.
- Redline checklist for pull requests.

## Narration only (paste into a voice generator)

Spacing is the quietest part of a layout and the easiest to get wrong. Most messy interfaces are not badly coloured or badly typeset. They have twenty slightly different gaps that nobody chose. In this lesson you will group with proximity, pick an 8 point scale, and let the parent own the gaps.

People assume that things close together belong together. The space between groups must be clearly larger than the space within a group. A form label that sits 16 pixels above its input and 16 pixels below the previous input is ambiguous. Which field does it belong to? A reliable rule: the gap between groups should be at least twice the gap inside a group.

An 8 point scale gives you a short menu: 4, 8, 12, 16, 24, 32, 48, 64. The 4 is for tight details, like the gap between an icon and its label. Everything else steps up in a way that is easy to see. The value of a scale is not the number 8. It is that decisions become choices from a list rather than guesses, and that two people working on the same screen end up with the same answer.

This settings row collected margins over time. Thirteen, eighteen, five, twenty-two. None of those numbers were a decision you could defend. The row uses the scale, and the parent owns the spacing. Inside the row, a 4 pixel gap keeps the title and description together. The settings list uses a 24 pixel gap between rows, more than twice the gap inside a row, so each row reads as its own group.

Using gap on the parent, instead of margins on the children, removes a whole class of bugs. No collapsing margins. No stray space after the last item. No need to remember which child carries the margin.

Separate spacing into two kinds. Inside a component, padding and the gap between its own parts. The component owns this. Between components, the layout around it. The parent owns this. Components that set their own outer margins are hard to reuse, because every new context needs a different margin.

When you hand over a design or review a pull request, annotate gaps with their scale values: 8, 16, 24. If a number is not on the scale, it is either a bug or a sign the scale needs a new step.

Space between groups should be clearly larger than space within them. Choose values from a short scale rather than inventing new ones. Let parents own the gaps between children, using gap. Next we stop counting gaps and start counting edges: a simple column grid, and alignment that still holds when the words change length.
