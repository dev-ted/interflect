# LESSON SCRIPT: Building a type system — Line length, line height and rhythm

## Metadata
- **Course:** Typography for interfaces (`typography-for-interfaces`)
- **Duration:** 3 minutes 6 seconds (402 spoken words at 130 per minute = 186 seconds). Narration-only cut: 353 words, 163 seconds. No pause time is added for code on screen.
- **Content type:** Screencast with voiceover.
- **Learning objective:** Keep lines readable at about 45 to 75 characters, and tighten line height as size grows.
- **Materials:** A help article at 1440px, the prose CSS below.
- **Source:** Seeded lesson `line-length-line-height-and-rhythm`.
- **Previous lesson:** Choosing a type scale.
- **Next lesson:** Weight, colour and contrast in text.

## Hook (27 seconds)

**On screen:** A help article stretched across a 1440px window. A character counter on one line reads about 180. The reader’s eye traces a long path back to the next line and misses.

**Say:**

A good font at a good size can still be tiring to read. The usual culprits are lines that run too long, and line height that does not match the size of the text. You will cap running text with the ch unit, tighten line height as type gets larger, and attach headings to the content they introduce.

## Core teaching (33 seconds)

**On screen:** Three columns of the same paragraph. 30 characters: choppy. 65: comfortable. 120: the return sweep is marked with a red arc.

**Say:**

The measure is the length of a line. For running text, 45 to 75 characters per line is comfortable, with about 65 as a sweet spot. Shorter lines feel choppy. Longer lines make it hard to find the start of the next one.

**On screen:** CSS, then the article constrained and centred, sidebar in the remaining space.

```css
.prose {
  max-width: 65ch;
}
```

**Say:**

CSS has a unit made for this. ch is the width of the zero character in the current font, so 65ch tracks the typeface rather than a pixel guess.

## Demo / walkthrough (1 minute 42 seconds)

**On screen:** Before and after of the help article. Before: full width, ~180 characters. After: max-width 65ch, centred, sidebar beside it.

**Say:**

Before, a help article sat in a full-width container on a 1440 pixel screen. Lines ran to about 180 characters and readers lost their place. After, the article is constrained to 65ch and centred, with the sidebar using the remaining space. Same content, noticeably easier to read, and the page looks more considered.

**On screen:** Three samples stacked. Body at line-height 1.5. Heading at 1.5, looking loose, then the same heading at 1.15, looking connected. Caption at 1.4.

```css
body { line-height: 1.5; }
h1, h2 { line-height: 1.15; }
.caption { line-height: 1.4; }
```

**Say:**

Small text needs generous line height. Large text needs less. A single line-height of 1.5 on everything makes headings look loose and disconnected. Use unitless values so line height scales with the element’s own font size, instead of inheriting a fixed pixel value from a parent.

**On screen:** A prose block. Highlight the sibling selector. Show extra space above an h2, and even space between paragraphs. No margin at the top of the container.

```css
.prose > * + * { margin-top: 1em; }
.prose h2 { margin-top: 2em; }
```

**Say:**

Vertical rhythm is the spacing between paragraphs, headings, and lists. Two rules cover most cases. Put more space above a heading than below it, so the heading attaches to the content it introduces. Keep paragraph spacing roughly equal to one line of body text. The star plus star selector adds space only between siblings, so there is no stray margin at the top of the container.

**On screen:** A button, a label, and a table cell on a 24px line. A note: “measure rarely applies”.

**Say:**

Interface text is different. Labels, buttons, and table cells are single lines, so measure rarely applies. What matters there is a consistent line height so text and icons align. A common approach is a fixed line height per step. For example, 16 pixel text on a 24 pixel line, which also lands on an 8 point grid.

## Activity

Constrain one article or empty state to 65ch. Set body line height to 1.5 and headings to about 1.15, unitless. Put more space above the heading than below it. You know you have it when a line of body text is in the 45 to 75 character range and the heading belongs to the paragraph under it. Stretch: set a 24 pixel line on 16 pixel label text and check icon alignment.

## Recap + bridge (23 seconds)

**On screen:** Three lines: About 65ch. Tighter line height as size grows. More space above a heading than below.

**Say:**

Cap running text at about 65ch. Tighten line height as text gets larger, and use unitless values. Space above headings should be larger than space below. Next, once the scale and the measure are set, most of the remaining hierarchy comes from weight and colour, not from another font size.

## Companion materials
- Measure card: 45–75 characters, 65ch default.
- Prose rhythm snippet.

## Narration only (paste into a voice generator)

A good font at a good size can still be tiring to read. The usual culprits are lines that run too long, and line height that does not match the size of the text. You will cap running text with the ch unit, tighten line height as type gets larger, and attach headings to the content they introduce.

The measure is the length of a line. For running text, 45 to 75 characters per line is comfortable, with about 65 as a sweet spot. Shorter lines feel choppy. Longer lines make it hard to find the start of the next one. CSS has a unit made for this. ch is the width of the zero character in the current font, so 65ch tracks the typeface rather than a pixel guess.

Before, a help article sat in a full-width container on a 1440 pixel screen. Lines ran to about 180 characters and readers lost their place. After, the article is constrained to 65ch and centred, with the sidebar using the remaining space. Same content, noticeably easier to read.

Small text needs generous line height. Large text needs less. A single line-height of 1.5 on everything makes headings look loose and disconnected. Use unitless values so line height scales with the element’s own font size, instead of inheriting a fixed pixel value from a parent.

Put more space above a heading than below it, so the heading attaches to the content it introduces. Keep paragraph spacing roughly equal to one line of body text. The sibling selector adds space only between elements, so there is no stray margin at the top of the container.

Labels, buttons, and table cells are single lines, so measure rarely applies. What matters there is a consistent line height so text and icons align. Sixteen pixel text on a 24 pixel line lands on an 8 point grid.

Cap running text at about 65ch. Tighten line height as text gets larger, and use unitless values. Space above headings should be larger than space below. Next, most of the remaining hierarchy comes from weight and colour, not from another font size.
