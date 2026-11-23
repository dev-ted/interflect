# LESSON SCRIPT: Keyboard and semantics — Buttons, links and the right element

## Metadata
- **Course:** Accessible components (`accessible-components`)
- **Duration:** 3 minutes 9 seconds (409 spoken words at 130 per minute = 189 seconds). Narration-only cut: 313 words, 144 seconds. No pause time is added for code on screen.
- **Content type:** Screencast with voiceover.
- **Learning objective:** Choose button or link by what the control does, and get keyboard support from the element.
- **Materials:** A save control, a form with Cancel, an icon-only close button.
- **Source:** Seeded lesson `buttons-links-and-the-right-element`.
- **Previous lesson:** Focus states people can see.
- **Next lesson:** Labelling forms and errors.

## Hook (22 seconds)

**On screen:** A div styled as a button. Mouse click works. Tab skips it. A screen reader caption says “plain text”.

**Say:**

Most accessibility bugs in components come from using the wrong element and then trying to patch the difference with attributes. Start with the right element and much of the work disappears. You will sort links from buttons by behaviour, set button types inside forms, and name icon-only controls.

## Core teaching (30 seconds)

**On screen:** Two columns. Link: “goes somewhere”, examples navigate, new page, jump to a section, element `<a href>`. Button: “does something”, examples submit, open, toggle, delete, save, element `<button>`. A footnote: styling is separate.

**Say:**

A link goes somewhere. It changes the URL, opens a new page, or jumps to a section. Use an anchor with an href. A button does something. It submits, opens, toggles, deletes, or saves. Use a button. Styling is a separate question. A button can look like a link, and a link can look like a button. What matters is what happens when it is activated.

## Demo / walkthrough (1 minute 48 seconds)

**On screen:** The before component. Then a keyboard pass: Tab never lands on “Save changes”.

```tsx
<div className="btn" onClick={save}>
  Save changes
</div>
```

**Say:**

This looks fine with a mouse. With a keyboard it cannot be reached by Tab, it does not respond to Enter or Space, and a screen reader announces it as plain text.

**On screen:** The after component. Tab lands on it. Enter and Space both save.

```tsx
<button type="button" className="btn" onClick={save}>
  Save changes
</button>
```

**Say:**

One element change gives you focusability, Enter and Space activation, the button role, and correct behaviour in forms. Adding role button and tabIndex 0 to the div would still leave you writing key handlers by hand, and it is easy to get subtly wrong.

**On screen:** A form. Cancel has no type. Pressing it submits. Then `type="button"` is added and Cancel no longer submits. The real submit button keeps the default.

**Say:**

A button inside a form defaults to type submit. A Cancel or Add another button without type button will submit the form unexpectedly. Set the type explicitly on every button that is not the submit action.

**On screen:** An X icon button. Without a name, the accessibility tree says “button”. With aria-label “Close dialog” and aria-hidden on the icon, it says “Close dialog, button”.

```tsx
<button type="button" aria-label="Close dialog">
  <XIcon aria-hidden="true" />
</button>
```

**Say:**

A button that contains only an icon has no accessible name unless you give it one. Hide the icon from assistive technology with aria-hidden so it is not announced twice, or as a meaningless graphic.

**On screen:** A links list from a screen reader: five items all say “Read more”. Replace with “Read the typography lesson”, “Read the focus lesson”, and so on.

**Say:**

Screen reader users often pull up a list of all links on a page. A list of five Read more links is useless. Write link text that describes the destination, such as “Read the typography lesson”, or add visually hidden text that completes it.

**On screen:** A disabled submit button. Tab skips it, so the reason it is unavailable is never announced. Alternative: the button stays focusable with aria-disabled, and a message next to it explains why.

**Say:**

A disabled button cannot be focused, so people using a keyboard may not discover it or learn why it is unavailable. When the reason matters, keep the button enabled and show a clear message on activation, or use aria-disabled true with explanatory text nearby.

## Activity

Find one clickable div in a component. Replace it with a button or a link based on whether it acts or navigates. Set type button on every non-submit button in that form. Tab to it and activate it with Enter and Space. You know you have it when the control is in the tab order and its name makes sense in a list of links or buttons. Stretch: replace “Read more” with destination text.

## Recap + bridge (28 seconds)

**On screen:** Three lines: Links navigate, buttons act. type=button on non-submit buttons. Name icon-only buttons.

**Say:**

Links navigate, buttons act. Pick the element by behaviour, not appearance. Set type button on non-submit buttons in forms. Give icon-only buttons an accessible name, and write link text that stands alone. Next, the same idea inside a form: every field needs a name that stays visible, and every error needs to be announced with the field it belongs to.

## Companion materials
- Decision card: goes somewhere → link; does something → button.
- Icon button and form-type snippets.

## Narration only (paste into a voice generator)

Most accessibility bugs in components come from using the wrong element and then trying to patch the difference with attributes. Start with the right element and much of the work disappears.

A link goes somewhere. It changes the URL, opens a new page, or jumps to a section. Use an anchor with an href. A button does something. It submits, opens, toggles, deletes, or saves. Use a button. A button can look like a link, and a link can look like a button. What matters is what happens when it is activated.

A div with a click handler looks fine with a mouse. With a keyboard it cannot be reached by Tab, it does not respond to Enter or Space, and a screen reader announces it as plain text. Changing it to a button gives you focus, keyboard activation, the button role, and correct form behaviour. Adding role button and a tab index to the div still leaves you writing key handlers by hand.

A button inside a form defaults to type submit. A Cancel button without type button will submit the form unexpectedly. Set the type explicitly on every button that is not the submit action.

A button that contains only an icon has no accessible name unless you give it one. Hide the icon with aria-hidden so it is not announced twice.

Screen reader users often open a list of every link on the page. Five links that all say Read more are useless. Write text that describes the destination.

A disabled button cannot be focused, so a keyboard user may never learn why it is unavailable. When the reason matters, keep it focusable and explain the reason nearby.

Links navigate, buttons act. Pick the element by behaviour, not appearance. Set type button on non-submit buttons in forms. Give icon-only buttons an accessible name, and write link text that stands alone.
