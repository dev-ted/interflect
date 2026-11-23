# LESSON SCRIPT: Tokens in practice — Semantic tokens and theming

## Metadata
- **Course:** Design systems & tokens (`design-systems-and-tokens`)
- **Duration:** 2 minutes 17 seconds (296 spoken words at 130 per minute = 137 seconds). Narration-only cut: 224 words, 103 seconds. No pause time is added for code on screen.
- **Content type:** Screencast with voiceover. Show light and dark on the same component.
- **Learning objective:** Name tokens by purpose so components stay the same while themes swap the values underneath.
- **Materials:** The semantic map, a badge before/after, a theme toggle.
- **Source:** Seeded lesson `semantic-tokens-and-theming`.
- **Previous lesson:** From hard-coded values to tokens.

## Hook (20 seconds)

**On screen:** A button using `var(--teal-500)`. A search results list shows every file that mentions teal. Dark mode means editing each one.

**Say:**

Primitive tokens tell you what a value is. Semantic tokens tell you what it is for. That second layer is what makes theming, rebrands, and dark mode manageable. You will keep components on role names, and swap only the mapping when the theme changes.

## Core teaching (58 seconds)

**On screen:** A button rule `background: var(--teal-500)` with a red note: “the component knows the palette”. Then the semantic map.

```css
:root {
  --color-surface: var(--neutral-0);
  --color-surface-subtle: var(--neutral-100);
  --color-border: var(--neutral-200);
  --color-text: var(--neutral-900);
  --color-text-muted: var(--neutral-500);
  --color-accent: var(--teal-500);
  --color-focus: var(--teal-500);
}
```

**Say:**

If a button uses teal-500 directly, dark mode means finding every component that uses teal and deciding, one by one, what it should become. The component knows too much about the palette. A semantic token describes the role instead: surface, border, text, accent, focus. Components use only semantic tokens. Primitives are referenced only inside the token layer.

**On screen:** Two columns, same custom property names. Light maps surface to neutral-0 and accent to teal-500. Dark maps surface to neutral-900 and accent to teal-400. The component CSS does not change.

```css
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --color-surface: var(--neutral-900);
    --color-surface-subtle: #262626;
    --color-border: #404040;
    --color-text: var(--neutral-0);
    --color-text-muted: #a3a3a3;
    --color-accent: var(--teal-400);
  }
}

:root[data-theme="dark"] {
  --color-surface: var(--neutral-900);
  --color-text: var(--neutral-0);
}
```

**Say:**

Dark mode becomes a new mapping, not a new set of components. The media query follows the operating system. The data-theme attribute lets a person override it. The selector skips the dark mapping when someone has pinned light. The accent shifts to a lighter teal in dark mode so it keeps enough contrast against a dark surface. A colour that works on white can be too dark on near-black.

## Demo / walkthrough (43 seconds)

**On screen:** Badge before. A separate `.badge-dark` class. Toggle the theme and the badge only updates if that extra class is present. Then the after rule. Toggle light, dark, and system. One rule. The badge follows.

```css
.badge { background: #f5f5f5; color: #171717; }
.dark .badge-dark { background: #262626; color: #fff; }
```

```css
.badge {
  background: var(--color-surface-subtle);
  color: var(--color-text);
}
```

**Say:**

Before, the badge hard-coded its colours and needed a separate dark class. After, it has one rule and works in both themes, because surface-subtle and text point somewhere else when the theme changes.

**On screen:** A name list. Keep: `--color-text-muted`, `--color-border-strong`, `--color-accent-hover`. Cross out: `--color-light-grey`, `--color-settings-page-card-border`.

**Say:**

Good semantic names describe role and, when needed, state. Text muted. Border strong. Accent hover. Avoid names that describe appearance, like light grey, because the name stops making sense the moment the theme changes. Keep the layer small. If you find yourself creating a token for the settings page card border, a variable inside that component is a better home.

## Activity

Take one component that references a primitive or a hex value. Point it at semantic tokens only. Add a dark mapping for those roles, including a lighter accent if contrast requires it. Toggle prefers-color-scheme and a data-theme override. You know you have it when the component file does not change between themes. Stretch: rename one appearance-based token to a role and update its uses.

## Recap (15 seconds)

**On screen:** Three lines: Components use semantic tokens. Themes are alternate mappings. Name the role, keep the list small.

**Say:**

Components consume semantic tokens. Only the token layer touches primitives. Themes are alternate mappings from semantic names to primitive values. Name by role and state, not by appearance, and keep the layer small.

## Companion materials
- Semantic map for light and dark.
- Badge before/after.
- Naming card: role and state, not appearance.

## Narration only (paste into a voice generator)

Primitive tokens tell you what a value is. Semantic tokens tell you what it is for. That second layer is what makes theming, rebrands, and dark mode manageable.

If a button uses a teal primitive directly, dark mode means finding every component that uses teal and deciding, one by one, what it should become. The component knows too much about the palette. A semantic token describes the role instead: surface, border, text, accent, focus. Components use only semantic tokens. Primitives are referenced only inside the token layer.

Dark mode becomes a new mapping, not a new set of components. The media query follows the operating system. A data-theme attribute lets a person override it. The accent shifts to a lighter teal in dark mode so it keeps enough contrast against a dark surface.

A badge that hard-coded its colours needed a separate dark class. Pointed at surface-subtle and text, it has one rule and works in both themes.

Name tokens by role and state. Text muted. Border strong. Accent hover. A name like light grey stops making sense when the theme changes. Keep the layer small. A token that only one component needs belongs inside that component.

Components consume semantic tokens. Only the token layer touches primitives. Themes are alternate mappings. Name by role and state, not by appearance, and keep the layer small.
