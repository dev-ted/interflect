# LESSON SCRIPT: Keyboard and semantics — Focus states people can see

## Metadata
- **Course:** Accessible components (`accessible-components`)
- **Duration:** 3 minutes 12 seconds (415 spoken words at 130 per minute = 192 seconds). Narration-only cut: 324 words, 150 seconds. No pause time is added for code on screen.
- **Content type:** Screencast with voiceover. Record a real Tab pass at the end.
- **Learning objective:** Design focus rings that are visible on every background and only appear when they help.
- **Materials:** A button on white and on teal, a dialog, keyboard only.
- **Source:** Seeded lesson `focus-states-people-can-see`.

## Hook (25 seconds)

**On screen:** A page. The mouse pointer is hidden. Tab moves, and there is no ring. The cursor is gone.

**Say:**

Keyboard users move through an interface one focusable element at a time. The focus indicator is their cursor. Removing it, or making it too faint to see, is like hiding the mouse pointer. You will replace a removed outline with focus-visible, keep that ring visible on every background, and check the page with Tab alone.

## Core teaching (38 seconds)

**On screen:** The before rule, struck through. A button shows a ring after a mouse click, then the ring disappears for everyone, including keyboard.

```css
/* Before */
button:focus {
  outline: none;
}
```

**Say:**

This line usually arrives because someone disliked the ring that appeared after a mouse click. It fixes that complaint and breaks keyboard navigation for everyone.

**On screen:** After rule. Mouse click on a button: no ring. Tab to the same button: a 2px teal ring, offset 2px. Then click a text input: the input still shows focus.

```css
/* After */
button:focus-visible {
  outline: 2px solid #14b8a6;
  outline-offset: 2px;
}
```

**Say:**

Browsers decide when focus should be shown. focus-visible matches when the user is navigating with a keyboard, and generally not after a mouse click on a button. You get a clear ring for keyboard users and no ring after a click. Text inputs still show focus on click, because people need to know where they are typing.

## Demo / walkthrough (1 minute 46 seconds)

**On screen:** A teal ring on a white page: visible. The same teal ring on a teal button: it disappears. Contrast callout: at least 3 to 1 against adjacent colours.

**Say:**

A focus indicator should have at least 3 to 1 contrast against the colours around it. A teal ring that works on white may disappear on a teal button.

**On screen:** Two techniques. First, outline-offset so the ring sits on the page, not on the button. Second, a double ring: dark outline plus a white box-shadow halo. Call out that outline is the one that survives high contrast.

```css
.button:focus-visible {
  outline: 2px solid #171717;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px #ffffff;
}
```

**Say:**

Offset the outline so it sits on the page background rather than on the component. For components that appear on varied backgrounds, use a double ring. Prefer outline over box-shadow alone. Outlines remain visible in Windows high contrast mode, where box shadows are removed. A shadow-only ring can vanish completely.

**On screen:** A grid that visually reorders cards with the order property. Tab jumps in DOM order, which no longer matches the picture. A warning: “visual order and tab order drifted”.

**Say:**

Focus should move in the same order as the visual layout. If you reorder items with CSS grid or the order property, the DOM order still controls tabbing, so the two can drift apart. Fix the source order. Do not ask CSS to invent a reading order the keyboard cannot follow.

**On screen:** Open a dialog: focus moves to the first control inside. Close it: focus returns to the button that opened it. Delete a list row: focus moves to the next row, not to the body.

**Say:**

When content changes, move focus deliberately. Opening a dialog moves focus into it. Closing it returns focus to the control that opened it, so the person keeps their place. Deleting a row moves focus to a sensible neighbour rather than dropping it on the page body. A well-built dialog component handles this for you, which is one reason to use a tested primitive rather than building your own.

**On screen:** Hands off the mouse. Tab through a short page. At each stop, a caption: “Can I see where I am? Is this where I expected to be?”

**Say:**

Unplug the mouse, or simply stop touching it. Press Tab through the page. At every stop, ask: can I see where I am, and is this where I expected to be?

## Activity

Find every `outline: none` in one component. Replace button focus with focus-visible, an outline, and an offset. Tab the page with the mouse untouched. You know you have it when every stop is visible on its real background, and closing a dialog returns you to the control that opened it. Stretch: turn on a forced-colours preview and confirm the ring is still there.

## Recap + bridge (23 seconds)

**On screen:** Three lines: Never remove focus without a replacement. focus-visible, outline, offset. Focus order matches visual order.

**Say:**

Never remove focus styles without replacing them. Use focus-visible, an outline, and an offset. Keep focus order aligned with visual order, and manage focus when content changes. Next: a lot of missing focus starts earlier, with a div pretending to be a button. Links go somewhere. Buttons do something.

## Companion materials
- Focus ring snippet: single ring and double ring.
- Keyboard test script: Tab, Shift+Tab, open dialog, close dialog, delete row.

## Narration only (paste into a voice generator)

Keyboard users move through an interface one focusable element at a time. The focus indicator is their cursor. Removing it, or making it too faint to see, is like hiding the mouse pointer. You will replace a removed outline with focus-visible, keep that ring visible on every background, and check the page with Tab alone.

The line that sets outline to none usually arrives because someone disliked the ring after a mouse click. It fixes that complaint and breaks keyboard navigation for everyone.

Browsers decide when focus should be shown. focus-visible matches when the user is navigating with a keyboard, and generally not after a mouse click on a button. Text inputs still show focus on click, because people need to know where they are typing.

A focus indicator should have at least 3 to 1 contrast against the colours around it. A teal ring that works on white may disappear on a teal button. Offset the outline so it sits on the page background. For mixed backgrounds, add a second ring. Prefer outline over box-shadow alone, because outlines remain visible in Windows high contrast mode, where box shadows are removed.

Focus should move in the same order as the visual layout. If you reorder items with CSS, the DOM order still controls tabbing, so the two can drift apart.

Opening a dialog moves focus into it. Closing it returns focus to the control that opened it. Deleting a row moves focus to a sensible neighbour rather than dropping it on the page body. A tested dialog primitive handles this for you.

Stop touching the mouse. Press Tab through the page. At every stop, ask: can I see where I am, and is this where I expected to be?

Never remove focus styles without replacing them. Use focus-visible, an outline, and an offset. Keep focus order aligned with visual order, and manage focus when content changes. Next: links go somewhere, and buttons do something.
