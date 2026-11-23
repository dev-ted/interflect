# LESSON SCRIPT: Hierarchy in text — Weight, colour and contrast in text

## Metadata
- **Course:** Typography for interfaces (`typography-for-interfaces`)
- **Duration:** 2 minutes 59 seconds (388 spoken words at 130 per minute = 179 seconds). Narration-only cut: 314 words, 145 seconds. No pause time is added for code on screen.
- **Content type:** Screencast with voiceover.
- **Learning objective:** Create text hierarchy with weight and neutral colours while keeping every level readable.
- **Materials:** A data table, a contrast checker, the tokens below.
- **Source:** Seeded lesson `weight-colour-and-contrast-in-text`.
- **Previous lesson:** Line length, line height and rhythm.

## Hook (24 seconds)

**On screen:** A tight table. Someone tries to make the header larger and the row height blows out. Undo. Then the same header steps back by colour and steps forward by weight, at the same size.

**Say:**

Once you have a type scale, the temptation is to use size for every distinction. In interfaces, where space is tight, weight and colour are often the better tools. You will limit yourself to two or three weights, check neutral colours against real backgrounds, and stop using colour as the only signal.

## Core teaching (1 minute)

**On screen:** A font specimen with Regular 400, Semibold 600, Bold 700 checked. Extra weights are greyed out.

**Say:**

Most products need regular, 400, for body. Medium or semibold, 500 to 600, for labels and emphasis. Bold, 700, for a few headings. Loading five weights costs bandwidth and invites inconsistency. If you use a variable font you can pick any weight on its axis, but the same discipline applies: name a few and use them.

**On screen:** Three swatches on white, with contrast ratios. #171717 strong. #404040 default. #737373 muted, labelled “about 4.7 to 1, passes AA”. A lighter grey, #A3A3A3, marked “fails”.

```css
:root {
  --text-strong: #171717;
  --text-default: #404040;
  --text-muted: #737373;
}
```

**Say:**

A short set of neutral text colours gives you hierarchy without any change in size. On a white background, #737373 has a contrast ratio of about 4.7 to 1, which passes the WCAG AA requirement of 4.5 to 1 for normal text. Lighter greys often look elegant in a mockup and fail in practice. Check every text colour against its real background, including hover and disabled states that people still need to read.

## Demo / walkthrough (1 minute 11 seconds)

**On screen:** The before table. Headers 14px bold. Cells 14px regular. Timestamps 12px and #A3A3A3, hard to read. A contrast badge says fail.

**Say:**

Before, a table used 14 pixel bold for column headers, 14 regular for cells, and 12 pixel light grey, #A3A3A3, for timestamps. The timestamps were hard to read and failed contrast.

**On screen:** After CSS applied. Headers same size as cells, semibold, muted. Cell text strong. Timestamps muted but the same size, digits lining up. Highlight `tabular-nums`.

```css
th {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-muted);
}

td {
  font-size: 0.875rem;
  color: var(--text-strong);
}

td time {
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}
```

**Say:**

Headers step back through colour and gain clarity through weight. Timestamps are the same size as the cells, so they stay readable, but they are clearly secondary. Tabular numerals keep each digit the same width, so columns of numbers line up. Proportional digits vary in width. Tabular figures make numbers easy to compare.

**On screen:** Two error lines. One is only red. The other is red, with an icon and the word “Error:”. A note: “do not rely on colour alone”.

**Say:**

If the only difference between an error and normal text is that it is red, some people will not see the difference. Pair colour with an icon, a label such as “Error”, or a change in weight.

**On screen:** An uppercase label with tracking 0.06em, looking open. A large heading with tracking -0.02em, looking tighter. Body text with tracking 0, labelled “leave it”.

**Say:**

Small uppercase labels benefit from a little extra tracking, around 0.04em to 0.08em. Large headings often look better with slightly negative tracking, around -0.01em to -0.02em. Body text should usually be left alone.

## Activity

Pick one dense component, a table or a list. Give it at most three weights and the three neutral text colours. Run contrast on every text colour against its real background, including a disabled state. You know you have it when secondary text still passes 4.5 to 1 and meaning never depends on colour alone. Stretch: turn a column of numbers onto tabular-nums and compare alignment.

## Recap (24 seconds)

**On screen:** Three lines: Two or three weights. Check contrast on the real background. Colour is never the only signal.

**Say:**

Use two or three weights and a few neutral text colours. Check every text colour for contrast against its real background. Never let colour be the only signal of meaning. The next course stays with that last rule and takes it into components: focus, the right element, and labels people can actually use.

## Companion materials
- Neutral text tokens and their contrast on white.
- Table header snippet.

## Narration only (paste into a voice generator)

Once you have a type scale, the temptation is to use size for every distinction. In interfaces, where space is tight, weight and colour are often the better tools. You will limit yourself to two or three weights, check neutral colours against real backgrounds, and stop using colour as the only signal.

Most products need regular, 400, for body. Medium or semibold, 500 to 600, for labels and emphasis. Bold, 700, for a few headings. Loading five weights costs bandwidth and invites inconsistency. If you use a variable font, name a few weights and use those.

A short set of neutral text colours gives you hierarchy without any change in size. Strong, default, and muted. On white, #737373 is about 4.7 to 1, which passes the WCAG AA requirement of 4.5 to 1 for normal text. Lighter greys often look elegant in a mockup and fail in practice. Check every text colour against its real background, including hover and disabled states that people still need to read.

Before, timestamps were 12 pixel light grey and failed contrast. After, headers step back through colour and gain clarity through weight. Timestamps are the same size as the cells, so they stay readable, but they are clearly secondary. Tabular numerals keep each digit the same width, so columns of numbers line up.

If the only difference between an error and normal text is that it is red, some people will not see the difference. Pair colour with an icon, a label such as Error, or a change in weight.

Small uppercase labels benefit from a little extra tracking, around 0.04em to 0.08em. Large headings often look better slightly tighter, around -0.01em to -0.02em. Leave body text alone.

Use two or three weights and a few neutral text colours. Check every text colour for contrast against its real background. Never let colour be the only signal of meaning.
