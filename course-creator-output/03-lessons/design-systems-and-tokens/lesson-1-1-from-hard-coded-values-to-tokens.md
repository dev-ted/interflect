# LESSON SCRIPT: Tokens in practice — From hard-coded values to tokens

## Metadata
- **Course:** Design systems & tokens (`design-systems-and-tokens`)
- **Duration:** 2 minutes 29 seconds (323 spoken words at 130 per minute = 149 seconds). Narration-only cut: 267 words, 123 seconds. No pause time is added for code on screen.
- **Content type:** Screencast with voiceover. Terminal plus a stylesheet.
- **Learning objective:** Audit the values in a codebase and consolidate them into a small set of primitive tokens.
- **Materials:** A component folder, the grep command, a card before/after.
- **Source:** Seeded lesson `from-hard-coded-values-to-tokens`.

## Hook (28 seconds)

**On screen:** A pile of hex chips that look identical: #E4E4E4, #E5E5E5, #E6E6E6. A caption: “three borders nobody can tell apart”.

**Say:**

A design token is a named design decision: a colour, a spacing step, a radius, a duration. Tokens let designers and engineers refer to the same decision by the same name, so changing it in one place changes it everywhere. You will audit what is actually in the code, collapse near-duplicates into primitives, and point a card at those names.

## Core teaching (50 seconds)

**On screen:** Terminal. Run the search. A sorted count of hex codes scrolls by, with a dozen greys near the top.

```bash
grep -rhoE "#[0-9a-fA-F]{6}" src | sort | uniq -c | sort -rn
```

**Say:**

Before naming anything, find out what is actually in use. A quick search of a stylesheet or component folder for hex codes and pixel values is usually revealing. It is common to find a dozen greys where three were intended, and borders in #E4E4E4, #E5E5E5, and #E6E6E6 that nobody can tell apart. Each near-duplicate is a decision someone made without a shared reference.

**On screen:** Primitive tokens. Neutral steps, two teals, three spaces, one radius. A caption: “raw values, neutral names”.

```css
:root {
  --neutral-0: #ffffff;
  --neutral-100: #f5f5f5;
  --neutral-200: #e5e5e5;
  --neutral-500: #737373;
  --neutral-900: #171717;

  --teal-500: #14b8a6;
  --teal-400: #2dd4bf;

  --space-2: 8px;
  --space-4: 16px;
  --space-6: 24px;

  --radius-2: 8px;
}
```

**Say:**

Primitive tokens describe raw values with neutral names. They form your palette and scales. Map every audited value to its nearest primitive. The three almost-identical borders all become neutral-200. If a value has no sensible home, ask whether it is a real need or an accident.

## Demo / walkthrough (43 seconds)

**On screen:** Card before. Then the same card after. They look almost identical. A callout lists what changed: #fff to neutral-0, #e4e4e4 to neutral-200, 7px radius to radius-2, 15px padding to space-4.

```css
.card {
  background: #fff;
  border: 1px solid #e4e4e4;
  border-radius: 7px;
  padding: 15px;
}
```

```css
.card {
  background: var(--neutral-0);
  border: 1px solid var(--neutral-200);
  border-radius: var(--radius-2);
  padding: var(--space-4);
}
```

**Say:**

The card looks almost identical, but now it moves with the system. Change radius-2 and every card, input, and menu that uses it follows. The 7 pixel radius and the 15 pixel padding were not a different design. They were drift. They map to 8 and 16.

**On screen:** A simple diagram. One JSON file in the centre. Arrows to CSS custom properties, a Tailwind config, and design-tool variables. A note under the web-only path: “CSS custom properties in one file are enough”.

**Say:**

Teams often keep tokens in a JSON file and generate CSS, Tailwind configuration, and design-tool variables from it. That is worth doing once more than one platform consumes the tokens. For a single web app, CSS custom properties in one file are a fine source of truth.

## Activity

Run the hex search on one folder. Group values that nobody could tell apart. Name primitives for the survivors and replace the hard-coded card, or one component, with those variables. You know you have it when changing one primitive updates every use, and no near-duplicate hex remains in that component. Stretch: do the same for spacing values that are not on the 8 point scale.

## Recap + bridge (28 seconds)

**On screen:** Three lines: Audit first. Primitives name raw values. One source of truth.

**Say:**

Audit what is in use before you design a token set. Primitive tokens name raw values. Map every existing value to one. Keep a single source of truth, and generate other formats only when you need them. Next, primitives tell you what a value is. Semantic tokens tell you what it is for, which is what makes a theme possible.

## Companion materials
- Audit command.
- Primitive starter: neutrals, accent, space, radius.

## Narration only (paste into a voice generator)

A design token is a named design decision: a colour, a spacing step, a radius, a duration. Tokens let designers and engineers refer to the same decision by the same name, so changing it in one place changes it everywhere.

Before naming anything, find out what is actually in use. Search a stylesheet or component folder for hex codes. It is common to find a dozen greys where three were intended, and borders in #E4E4E4, #E5E5E5, and #E6E6E6 that nobody can tell apart. Each near-duplicate is a decision someone made without a shared reference.

Primitive tokens describe raw values with neutral names. They form your palette and scales. Map every audited value to its nearest primitive. The three almost-identical borders all become one neutral step. If a value has no sensible home, ask whether it is a real need or an accident.

A card that used a raw white, a one-off border, a 7 pixel radius, and 15 pixels of padding can point at primitives instead. It looks almost identical, but now it moves with the system. Change the radius token and every card, input, and menu that uses it follows.

Keep tokens in one place. Generate CSS, Tailwind, and design-tool variables from a JSON file once more than one platform consumes them. For a single web app, CSS custom properties in one file are a fine source of truth.

Audit what is in use before you design a token set. Primitive tokens name raw values. Map every existing value to one. Keep a single source of truth, and generate other formats only when you need them.
