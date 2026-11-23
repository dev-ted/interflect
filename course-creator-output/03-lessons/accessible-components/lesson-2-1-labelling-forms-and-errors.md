# LESSON SCRIPT: Forms people can complete — Labelling forms and errors

## Metadata
- **Course:** Accessible components (`accessible-components`)
- **Duration:** 2 minutes 24 seconds (312 spoken words at 130 per minute = 144 seconds). Narration-only cut: 254 words, 117 seconds. No pause time is added for code on screen.
- **Content type:** Screencast with voiceover. Include one screen-reader pass if the producer can record VoiceOver or NVDA.
- **Learning objective:** Connect labels, hints, and error messages to their inputs so everyone knows what to enter and what went wrong.
- **Materials:** An email field, a password field, a multi-error form, a radio group.
- **Source:** Seeded lesson `labelling-forms-and-errors`.
- **Previous lesson:** Buttons, links and the right element.

## Hook (25 seconds)

**On screen:** An email field with only a placeholder. The person types, the placeholder vanishes, and the field has no name left. A screen reader caption: “edit text, blank”.

**Say:**

Forms are where interfaces ask people for effort. Every unclear label or silent error costs them time, and for screen reader users an unlabelled field can be a dead end. You will replace placeholders with real labels, connect hints and errors to the input, and put a summary at the top when several fields fail.

## Core teaching (29 seconds)

**On screen:** Before: placeholder “Email address”. Type a character and the prompt disappears. The placeholder colour is low contrast.

```html
<input type="email" placeholder="Email address" />
```

**Say:**

The placeholder vanishes as soon as someone starts typing. It usually has low contrast. Many screen readers do not treat it as a reliable name.

**On screen:** After: a visible label “Email address”, for and id matched, autocomplete email. Clicking the label focuses the input.

```html
<label for="email">Email address</label>
<input id="email" type="email" autocomplete="email" />
```

**Say:**

A visible label stays put. Clicking it focuses the input, and assistive technology announces it. The autocomplete attribute lets browsers and password managers fill the field, which helps everyone, and especially people with motor or memory impairments.

## Demo / walkthrough (1 minute 16 seconds)

**On screen:** Password field. The hint “At least 12 characters.” is a paragraph with an id, not a tooltip. aria-describedby on the input points at that id. On focus, a caption shows the announcement: “Password, edit text, at least 12 characters.”

```html
<label for="password">Password</label>
<p id="password-hint">At least 12 characters.</p>
<input id="password" type="password" aria-describedby="password-hint" />
```

**Say:**

Format requirements belong in a hint connected to the input, not hidden in a tooltip. aria-describedby makes the hint part of what is announced when the field receives focus.

**On screen:** The React email field in two states. Valid: no error. Invalid: aria-invalid true, aria-describedby email-error, and the message “Enter an email address like name@example.com”. A bad message “Invalid input” is crossed out beside it.

```tsx
function EmailField({ error }: { error?: string }) {
  return (
    <div className="field">
      <label htmlFor="email">Email address</label>
      <input
        id="email"
        type="email"
        autoComplete="email"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "email-error" : undefined}
      />
      {error && (
        <p id="email-error" className="error">
          {error}
        </p>
      )}
    </div>
  );
}
```

**Say:**

A good error says what went wrong and how to fix it, appears next to the field, and is connected to it. aria-invalid tells assistive technology the field has a problem, and aria-describedby reads the message. Write the message as an instruction. “Enter an email address like name@example.com” is more useful than “Invalid input”.

**On screen:** Submit a form with three errors. Focus moves to a summary at the top. Each error is a link. Activating one jumps to that field.

**Say:**

When a form with several errors is submitted, move focus to a summary at the top that lists each error as a link to its field. People using a screen reader hear that something went wrong straight away, and everyone gets a quick way to jump to each problem.

**On screen:** Radio buttons for delivery speed inside a fieldset. The legend is “Delivery speed”. Focusing “Standard” announces “Delivery speed, Standard”.

**Say:**

Related controls, such as a set of radio buttons, belong in a fieldset with a legend. The legend is announced with each option, so “Delivery speed, Standard” makes sense on its own.

## Activity

Take one form. Give every input a visible label wired with for and id, or htmlFor. Move format rules into a hint with aria-describedby. On error, set aria-invalid and point aria-describedby at an instruction, not a code. You know you have it when focus on the field announces the label and, when present, the hint or the error. Stretch: add an error summary and move focus to it on submit.

## Recap (14 seconds)

**On screen:** Three lines: Visible label, programmatically connected. aria-describedby for hints and errors. Errors are instructions.

**Say:**

Every input needs a visible, programmatically connected label. Use aria-describedby for hints and errors, and aria-invalid when a field fails. Write errors as instructions, and give multi-error forms a focused summary.

## Companion materials
- Field pattern: label, hint, error, autocomplete.
- Error-summary pattern.

## Narration only (paste into a voice generator)

Forms are where interfaces ask people for effort. Every unclear label or silent error costs them time, and for screen reader users an unlabelled field can be a dead end.

A placeholder vanishes as soon as someone starts typing. It usually has low contrast, and many screen readers do not treat it as a reliable name. A visible label stays put. Clicking it focuses the input, and assistive technology announces it. Autocomplete lets browsers and password managers fill the field.

Format requirements belong in a hint connected to the input, not hidden in a tooltip. aria-describedby makes the hint part of what is announced when the field receives focus.

A good error says what went wrong and how to fix it, appears next to the field, and is connected to it. aria-invalid marks the problem. aria-describedby reads the message. Write the message as an instruction. Enter an email address like name@example.com is more useful than Invalid input.

When several fields fail, move focus to a summary at the top that lists each error as a link to its field. People hear that something went wrong straight away, and everyone can jump to each problem.

Related controls, such as radio buttons, belong in a fieldset with a legend. The legend is announced with each option, so Delivery speed, Standard makes sense on its own.

Every input needs a visible, programmatically connected label. Use aria-describedby for hints and errors, and aria-invalid when a field fails. Write errors as instructions, and give multi-error forms a focused summary.
