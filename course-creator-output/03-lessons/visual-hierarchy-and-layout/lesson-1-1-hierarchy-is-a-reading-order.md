# LESSON SCRIPT: Reading order — Hierarchy is a reading order

## Metadata
- **Course:** Visual hierarchy & layout (`visual-hierarchy-and-layout`)
- **Duration:** 3 minutes 30 seconds (455 spoken words at 130 per minute = 210 seconds). Narration-only cut: 438 words, 202 seconds. No pause time is added for code on screen.
- **Content type:** Screencast with voiceover. No on-camera shot required.
- **Learning objective:** Rank the content on a screen, then use size, weight, colour, and position so that ranking is visible.
- **Materials:** A pricing card in the browser, the before/after HTML and CSS below, devtools blur.
- **Source:** Seeded lesson `hierarchy-is-a-reading-order`.

## Hook (30 seconds)

**On screen:** A pricing card where plan name, price, description, feature line, and button are all 16px and the same colour. Everything looks equally important.

**Say:**

Every screen is read in some order, whether you planned it or not. Visual hierarchy is choosing that order on purpose. Before you touch a font size, write down what someone should notice first, second, and third. By the end of this lesson you will rank a pricing card, style that ranking with one or two levers at a time, and check it with a blur.

## Core teaching (1 minute 28 seconds)

**On screen:** The same card. A numbered list fades in beside it: 1 price, 2 plan name, 3 call to action, 4 everything else.

**Say:**

Take a pricing card. A typical first draft gives everything equal weight. Plan name, price, description, feature list, and button all sit at 16 pixels in the same colour. The eye has nowhere to land, so people read top to bottom, or they give up.

Rank it instead. The price comes first, because it answers the question the person came with. The plan name comes second, so they know what the price buys. The call to action is third. Everything else is fourth. Now you have a brief for the styling.

**On screen:** Four labels appear, one at a time: Size. Weight. Colour and contrast. Position and space. Under Size, show 16px next to 17px marked “noise”, then 16px next to 32px marked “a decision”.

**Say:**

You only need a few tools to express a ranking.

Size. Larger reads first. Keep the jumps clear. Sixteen pixels next to seventeen is noise. Sixteen next to thirty-two is a decision.

Weight. A semibold label beside regular text creates hierarchy without changing size.

Colour and contrast. Secondary text in a softer neutral, for example #737373 on white, steps back while staying readable.

Position and space. In a left-to-right language, things at the top left, and things with more room around them, get noticed sooner.

Use one or two levers per step down. Using all four at once usually overshoots.

## Demo / walkthrough (1 minute 3 seconds)

**On screen:** Code editor. Show the before markup, then the rendered card. Pause so the code can be read.

```html
<div class="card">
  <p>Pro</p>
  <p>R50 per month</p>
  <p>Everything in Free, plus quizzes and the tutor.</p>
  <button>Upgrade</button>
</div>
```

**Say:**

Here is the before. Four paragraphs and a button, no classes, so the browser gives them the same voice.

**On screen:** Replace with the after markup and CSS. Render the card: price at 2rem bold, “Pro” as a small semibold eyebrow, description muted, Upgrade as a primary button.

```html
<div class="card">
  <p class="eyebrow">Pro</p>
  <p class="price">R50 <span>per month</span></p>
  <p class="muted">Everything in Free, plus quizzes and the tutor.</p>
  <button class="primary">Upgrade</button>
</div>
```

```css
.eyebrow { font-size: 0.875rem; font-weight: 600; color: #737373; }
.price { font-size: 2rem; font-weight: 700; line-height: 1.1; }
.price span { font-size: 1rem; font-weight: 400; color: #737373; }
.muted { color: #737373; }
```

**Say:**

The price now carries the card. Two rem, weight 700. “Per month” drops back to one rem and the muted colour, so the number stays the hero. The plan name is small, but weight and colour keep it distinct. The description steps back to the same neutral, without a size change, because it is further down the ranking. One or two levers per step.

**On screen:** Devtools. Apply a heavy CSS blur (`filter: blur(8px)`) to the card. The price shape still dominates. Remove the blur.

**Say:**

A quick test. Blur your eyes, or apply a heavy blur in devtools, and look at the screen. The shapes that still stand out are your real hierarchy. If they are not the ones on your list, adjust the levers until they are. The blur removes the words and leaves size, weight, and contrast.

## Activity

Rework one card from a current screen. Write the ranking of four items before you change CSS. Change one or two properties per step. Blur the result. You know you have it when the blurred shapes match the written ranking. Stretch: do the same card with weight and colour only, no size change, and see what you lose.

## Recap + bridge (28 seconds)

**On screen:** Three lines: Rank first. One or two levers per step. Test with a blur.

**Say:**

Write the ranking down before you style anything. Each step down the ranking should change one or two properties, clearly. Test with a blur, not with your memory of the content. Next, those gaps you used to separate the price from the description get a system of their own: an 8 point spacing scale, and a rule for what belongs together.

## Companion materials
- Before/after pricing card HTML and CSS (in this script).
- One-page checklist: ranking, levers used, blur test.

## Narration only (paste into a voice generator)

Every screen is read in some order, whether you planned it or not. Visual hierarchy is choosing that order on purpose. Before you touch a font size, write down what someone should notice first, second, and third. By the end of this lesson you will rank a pricing card, style that ranking with one or two levers at a time, and check it with a blur.

Take a pricing card. A typical first draft gives everything equal weight. Plan name, price, description, feature list, and button all sit at 16 pixels in the same colour. The eye has nowhere to land, so people read top to bottom, or they give up.

Rank it instead. The price comes first, because it answers the question the person came with. The plan name comes second, so they know what the price buys. The call to action is third. Everything else is fourth. Now you have a brief for the styling.

You only need a few tools to express a ranking. Size: larger reads first. Keep the jumps clear. Sixteen pixels next to seventeen is noise. Sixteen next to thirty-two is a decision. Weight: a semibold label beside regular text creates hierarchy without changing size. Colour and contrast: secondary text in a softer neutral, for example #737373 on white, steps back while staying readable. Position and space: in a left-to-right language, things at the top left, and things with more room around them, get noticed sooner. Use one or two levers per step down. Using all four at once usually overshoots.

Here is the before. Four blocks and a button, no classes, so the browser gives them the same voice. The price now carries the card. Two rem, weight 700. “Per month” drops back to one rem and the muted colour, so the number stays the hero. The plan name is small, but weight and colour keep it distinct. The description steps back to the same neutral, without a size change, because it is further down the ranking.

A quick test. Blur your eyes, or apply a heavy blur in devtools, and look at the screen. The shapes that still stand out are your real hierarchy. If they are not the ones on your list, adjust the levers until they are.

Write the ranking down before you style anything. Each step down the ranking should change one or two properties, clearly. Test with a blur, not with your memory of the content. Next, the gaps you used to separate the price from the description get a system of their own: an 8 point spacing scale, and a rule for what belongs together.
