import { internalMutation, mutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { requireAdmin } from "./lib/auth";

const DEMO_MUX_PLAYBACK_ID = "BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM";

interface SeedLesson {
  title: string;
  slug: string;
  summary: string;
  isFreePreview: boolean;
  durationSeconds: number;
  muxPlaybackId: string;
  markdownContent: string;
  quiz: Array<{
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>;
}

interface SeedModule {
  title: string;
  description: string;
  lessons: SeedLesson[];
}

interface SeedCourse {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  thumbnailUrl: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  tier: "free" | "pro";
  featured: boolean;
  estimatedHours: number;
  tags: string[];
  modules: SeedModule[];
}

const SEED_COURSES: SeedCourse[] = [
  {
    slug: "visual-hierarchy-and-layout",
    title: "Visual hierarchy & layout",
    subtitle:
      "Decide what people see first, then build spacing and grids that make that order obvious.",
    description:
      "A practical introduction to the decisions behind every screen: what matters most, how size, weight and space signal it, and how a simple spacing scale and grid keep a layout calm as it grows. You will rework real interface fragments and leave with rules you can apply on your next pull request.",
    thumbnailUrl: "/courses/visual-hierarchy-and-layout.svg",
    category: "UI principles",
    level: "beginner",
    tier: "free",
    featured: true,
    estimatedHours: 2,
    tags: ["Hierarchy", "Spacing", "Layout", "CSS grid"],
    modules: [
      {
        title: "Reading order",
        description:
          "How people scan a screen and the handful of tools that steer their eyes.",
        lessons: [
          {
            title: "Hierarchy is a reading order",
            slug: "hierarchy-is-a-reading-order",
            summary:
              "Rank the content on a screen, then use size, weight, colour and position to make that ranking visible.",
            isFreePreview: true,
            durationSeconds: 612,
            muxPlaybackId: DEMO_MUX_PLAYBACK_ID,
            markdownContent: `# Hierarchy is a reading order

Every screen is read in some order, whether you plan it or not. Visual hierarchy is the practice of choosing that order on purpose. Before you touch a font size, write down what someone should notice first, second and third.

## Rank before you style

Take a pricing card. A typical first draft gives everything equal weight: plan name, price, description, feature list and button all sit at 16px in the same colour. The eye has nowhere to land, so people read top to bottom or give up.

Rank it instead:

1. The price, because it answers the question the person came with
2. The plan name, so they know what the price buys
3. The call to action
4. Everything else

Now you have a brief for the styling.

## The four levers

You only need a few tools to express a ranking:

- **Size.** Larger reads first. Keep the jumps clear; 16px next to 17px is noise, 16px next to 32px is a decision.
- **Weight.** A semibold label beside regular text creates hierarchy without changing size.
- **Colour and contrast.** Secondary text in a softer neutral (for example #737373 on white) steps back while staying readable.
- **Position and space.** Things at the top left (in left-to-right languages) and things with more room around them get noticed sooner.

Use one or two levers per step down. Using all four at once usually overshoots.

## Before and after

Before:

\`\`\`html
<div class="card">
  <p>Pro</p>
  <p>$12 per month</p>
  <p>Everything in Free, plus quizzes and the tutor.</p>
  <button>Upgrade</button>
</div>
\`\`\`

After:

\`\`\`html
<div class="card">
  <p class="eyebrow">Pro</p>
  <p class="price">$12 <span>per month</span></p>
  <p class="muted">Everything in Free, plus quizzes and the tutor.</p>
  <button class="primary">Upgrade</button>
</div>
\`\`\`

\`\`\`css
.eyebrow { font-size: 0.875rem; font-weight: 600; color: #737373; }
.price { font-size: 2rem; font-weight: 700; line-height: 1.1; }
.price span { font-size: 1rem; font-weight: 400; color: #737373; }
.muted { color: #737373; }
\`\`\`

The price now carries the card. The plan name is small but distinct thanks to weight and colour, and the description steps back.

## A quick test

Blur your eyes, or apply a heavy CSS blur in devtools, and look at the screen. The shapes that still stand out are your real hierarchy. If they are not the ones on your list, adjust the levers until they are.

## Takeaways

- Write the ranking down before styling anything.
- Each step down the ranking should change one or two properties, clearly.
- Test with a blur, not with your own memory of the content.`,
            quiz: [
              {
                id: "q1",
                question:
                  "What should you do before choosing font sizes for a new card?",
                options: [
                  "Pick a typeface pairing",
                  "Rank the content by what the reader needs first",
                  "Apply the brand colour to every heading",
                  "Make every element the same size so nothing competes",
                ],
                correctIndex: 1,
                explanation:
                  "Hierarchy expresses a ranking. Without deciding the order first, styling choices have nothing to communicate.",
              },
              {
                id: "q2",
                question:
                  "A label at 16px sits next to body text at 17px. Why is this a weak hierarchy?",
                options: [
                  "17px is not on the 8 point grid",
                  "The difference is too small to read as intentional",
                  "Labels must always be larger than body text",
                  "Browsers round 17px down to 16px",
                ],
                correctIndex: 1,
                explanation:
                  "Tiny differences look like mistakes. A clear jump in size, or a change in weight or colour, reads as a decision.",
              },
              {
                id: "q3",
                question: "What does the blur test reveal?",
                options: [
                  "Which images are too low resolution",
                  "Whether the colour contrast passes WCAG",
                  "Which shapes actually dominate the screen",
                  "How the layout behaves on slow networks",
                ],
                correctIndex: 2,
                explanation:
                  "Blurring removes the words, leaving only size, weight and contrast. What still stands out is the hierarchy people really perceive.",
              },
            ],
          },
          {
            title: "Spacing on an 8 point scale",
            slug: "spacing-on-an-8-point-scale",
            summary:
              "Replace ad hoc margins with a small spacing scale and use proximity to group related things.",
            isFreePreview: false,
            durationSeconds: 708,
            muxPlaybackId: DEMO_MUX_PLAYBACK_ID,
            markdownContent: `# Spacing on an 8 point scale

Spacing is the quietest part of a layout and the easiest to get wrong. Most messy interfaces are not badly coloured or badly typeset; they have twenty slightly different gaps that nobody chose.

## Proximity does the grouping

People assume that things close together belong together. That means the space between groups must be clearly larger than the space within a group. A form label that sits 16px above its input and 16px below the previous input is ambiguous: which field does it belong to?

A reliable rule: the gap between groups should be at least twice the gap inside a group.

## Pick a scale and stick to it

An 8 point scale gives you a short menu of values: 4, 8, 12, 16, 24, 32, 48, 64. The 4 is for tight details like the gap between an icon and its label. Everything else steps up in a way that is easy to see.

The value of a scale is not the number 8. It is that decisions become choices from a list rather than guesses, and that two people working on the same screen end up with the same answer.

## Before and after

Before, a settings row collected margins over time:

\`\`\`css
.row { padding: 13px 18px; }
.row h3 { margin-bottom: 5px; }
.row p { margin-bottom: 22px; }
\`\`\`

After, the row uses the scale and the parent owns the spacing:

\`\`\`css
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
\`\`\`

Using \`gap\` on the parent instead of margins on children removes a whole class of bugs: no collapsing margins, no stray space after the last item, and no need to remember which child carries the margin.

## Inside versus outside

A useful habit is to separate spacing into two kinds:

- **Inside a component**: padding and the gap between its own parts. The component owns this.
- **Between components**: the layout around it. The parent owns this.

Components that set their own outer margins are hard to reuse, because every new context needs a different margin.

## Redlines

When you hand over a design or review a pull request, annotate gaps with their scale values: 8, 16, 24. If a number does not appear in the scale, it is either a bug or a sign the scale needs a new step. Both are worth a conversation.

## Takeaways

- Space between groups should be clearly larger than space within them.
- Choose values from a short scale rather than inventing new ones.
- Let parents own the gaps between children, using \`gap\`.`,
            quiz: [
              {
                id: "q1",
                question:
                  "A label sits 16px from its input and 16px from the input above. What is the problem?",
                options: [
                  "16px is not part of an 8 point scale",
                  "The label is equally close to both inputs, so its group is ambiguous",
                  "Labels should always be inside the input",
                  "There is no problem as long as the gaps match",
                ],
                correctIndex: 1,
                explanation:
                  "Proximity signals grouping. When the gap above and below is equal, the label belongs to neither field visually.",
              },
              {
                id: "q2",
                question: "Why prefer gap on a parent over margin on each child?",
                options: [
                  "gap is faster to render",
                  "Margins do not work inside grid containers",
                  "The parent controls spacing in one place and there is no extra space after the last child",
                  "gap supports negative values",
                ],
                correctIndex: 2,
                explanation:
                  "gap only applies between items, so it avoids trailing space and collapsing margins, and keeps spacing decisions in the layout that owns them.",
              },
            ],
          },
        ],
      },
      {
        title: "Layout that holds",
        description: "Grids and alignment that stay tidy as content changes.",
        lessons: [
          {
            title: "Grids and alignment",
            slug: "grids-and-alignment",
            summary:
              "Use a simple column grid and shared alignment edges so layouts look intentional at every width.",
            isFreePreview: false,
            durationSeconds: 794,
            muxPlaybackId: DEMO_MUX_PLAYBACK_ID,
            markdownContent: `# Grids and alignment

A grid is not decoration. It is a promise that things which look aligned really are aligned, at every screen width and with every length of content.

## Fewer edges, calmer screens

Count the distinct left edges on a screen. A dashboard with a heading, a filter bar, three cards and a table might have seven different left edges if each was placed by eye. Each edge is a small visual event. Reducing them to two or three is often the single biggest improvement you can make to a busy layout.

## A twelve column grid, lightly

Twelve columns divide neatly into halves, thirds, quarters and sixths, which is why the number is so common. You do not need to use all twelve. Most product screens use a few spans: full width, two thirds plus one third, or three equal cards.

\`\`\`css
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
\`\`\`

Note \`minmax(0, 1fr)\` instead of plain \`1fr\`. Without it, a long URL or code block inside a column can force that column wider than its share and break the grid.

## Before and after

Before: a profile header where the avatar, name and action button are each centred in their own flex box. Text baselines do not line up, and the button floats a few pixels lower than the name.

After: one row with \`align-items: center\` for the avatar and a shared baseline for the name and button text.

\`\`\`css
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
\`\`\`

The name and the button label now sit on the same invisible line, which is what the eye checks first.

## Optical alignment

Sometimes mathematically aligned things look wrong. A play icon centred in a circle looks shifted left because its visual weight sits on one side. Round shapes look smaller than squares of the same size. It is fine to nudge these by a pixel or two. Align to what people see, then leave a comment so the next person does not undo it.

## Takeaways

- Count the left edges and remove the ones you did not mean to create.
- Use a column grid with a small set of spans, and \`minmax(0, 1fr)\` to keep columns honest.
- Align text on baselines, and trust your eye for icons and round shapes.`,
            quiz: [
              {
                id: "q1",
                question:
                  "Why use minmax(0, 1fr) rather than 1fr for grid columns?",
                options: [
                  "It makes columns animate smoothly",
                  "It stops long content from forcing a column wider than its share",
                  "It is required for gap to work",
                  "It removes the need for media queries",
                ],
                correctIndex: 1,
                explanation:
                  "1fr has an automatic minimum based on content. minmax(0, 1fr) lets the column shrink below its content size so the grid stays even.",
              },
              {
                id: "q2",
                question:
                  "A play icon is mathematically centred in a circle but looks off. What is the right move?",
                options: [
                  "Leave it, since the maths is correct",
                  "Replace the circle with a square",
                  "Nudge it optically and leave a comment explaining why",
                  "Increase the icon size until it fills the circle",
                ],
                correctIndex: 2,
                explanation:
                  "Alignment is about perception. A small optical offset fixes what people see, and a comment protects it from being reverted.",
              },
              {
                id: "q3",
                question:
                  "What is usually the fastest way to calm a busy dashboard layout?",
                options: [
                  "Add more borders between sections",
                  "Reduce the number of distinct alignment edges",
                  "Switch to a darker colour palette",
                  "Increase every font size by one step",
                ],
                correctIndex: 1,
                explanation:
                  "Each unintended edge is visual noise. Sharing a few edges across sections makes the layout feel planned.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "typography-for-interfaces",
    title: "Typography for interfaces",
    subtitle:
      "Type scales, line length and contrast for text that people read in apps, not on posters.",
    description:
      "Interface text is mostly small, functional and read in a hurry. This course covers the type decisions that make it work: a modular scale you can defend, comfortable line length and line height, and using weight and colour instead of size for most hierarchy. Every lesson ends with CSS you can drop into a project.",
    thumbnailUrl: "/courses/typography-for-interfaces.svg",
    category: "UI principles",
    level: "beginner",
    tier: "pro",
    featured: false,
    estimatedHours: 2,
    tags: ["Typography", "Type scale", "Readability", "CSS"],
    modules: [
      {
        title: "Building a type system",
        description:
          "A scale, a rhythm and a few rules that cover most interface text.",
        lessons: [
          {
            title: "Choosing a type scale",
            slug: "choosing-a-type-scale",
            summary:
              "Build a small modular scale, name its steps by role and stop inventing font sizes.",
            isFreePreview: true,
            durationSeconds: 655,
            muxPlaybackId: DEMO_MUX_PLAYBACK_ID,
            markdownContent: `# Choosing a type scale

Most interfaces need far fewer font sizes than they use. An audit of a mature product often finds fifteen or more sizes, many of them a pixel apart. A type scale replaces that drift with a short, deliberate list.

## Modular scales

A modular scale multiplies a base size by a ratio. With a 16px base and a ratio of 1.25 you get roughly 12.8, 16, 20, 25, 31 and 39. Round those to whole pixels and you have a scale.

Ratio guides the feel:

- **1.125 to 1.2**: compact, good for dense dashboards and tools
- **1.25**: a balanced default for most products
- **1.333 and up**: dramatic, better suited to marketing pages with big headlines

You can use a tighter ratio inside the app and a larger one for marketing, as long as they share the same base.

## Name steps by role, not size

Names like \`text-20\` invite people to add \`text-21\`. Role names keep the list closed:

\`\`\`css
:root {
  --text-caption: 0.75rem;   /* 12px */
  --text-body: 1rem;         /* 16px */
  --text-lead: 1.25rem;      /* 20px */
  --text-title: 1.5625rem;   /* 25px */
  --text-display: 2.4375rem; /* 39px */
}
\`\`\`

Use rem so the scale follows the reader's browser font size setting. People who set a larger default are often the ones who need it most.

## Before and after

Before, a modal used 15px for body, 17px for the title and 13px for helper text, chosen one at a time over several sprints.

After, the modal uses three steps from the scale: \`--text-title\` for the heading, \`--text-body\` for the content and \`--text-caption\` for helper text. The title is now clearly a title, and the helper text is clearly secondary instead of almost the same.

## Fluid sizes, sparingly

For large display text you can let size grow with the viewport:

\`\`\`css
h1 {
  font-size: clamp(2rem, 1.5rem + 2vw, 3rem);
}
\`\`\`

Keep body text fixed. Fluid body sizes make line length and spacing harder to reason about, and the gain is small.

## Takeaways

- Pick a base and a ratio, round the results and commit to five or six steps.
- Name steps by role so the list stays short.
- Use rem, and reserve fluid sizing for display text.`,
            quiz: [
              {
                id: "q1",
                question:
                  "Which ratio suits a dense data tool better than a marketing page?",
                options: ["1.618", "1.5", "1.2", "2.0"],
                correctIndex: 2,
                explanation:
                  "Smaller ratios produce gentler steps, which keeps headings from taking too much room in dense interfaces.",
              },
              {
                id: "q2",
                question: "Why name scale steps by role, such as body or title?",
                options: [
                  "Role names compile to smaller CSS",
                  "They discourage adding near-duplicate sizes",
                  "Browsers apply role names to accessibility trees",
                  "Pixel names are not valid custom properties",
                ],
                correctIndex: 1,
                explanation:
                  "A name like text-20 suggests text-21 is reasonable. Roles keep the list closed and the intent clear.",
              },
              {
                id: "q3",
                question: "Why define font sizes in rem?",
                options: [
                  "rem renders faster than px",
                  "rem respects the reader's default font size setting",
                  "rem avoids subpixel rounding",
                  "px is deprecated in modern CSS",
                ],
                correctIndex: 1,
                explanation:
                  "rem scales with the root font size, so readers who increase their browser default get proportionally larger text.",
              },
            ],
          },
          {
            title: "Line length, line height and rhythm",
            slug: "line-length-line-height-and-rhythm",
            summary:
              "Keep lines readable with a measure of about 45 to 75 characters and line height that tightens as size grows.",
            isFreePreview: false,
            durationSeconds: 590,
            muxPlaybackId: DEMO_MUX_PLAYBACK_ID,
            markdownContent: `# Line length, line height and rhythm

A good font at a good size can still be tiring to read. The usual culprits are lines that run too long and line height that does not match the size of the text.

## Measure

The measure is the length of a line. For running text, 45 to 75 characters per line is comfortable, with about 65 as a sweet spot. Shorter lines feel choppy; longer lines make it hard to find the start of the next one.

CSS has a unit made for this:

\`\`\`css
.prose {
  max-width: 65ch;
}
\`\`\`

\`ch\` is the width of the zero character in the current font, so it tracks the typeface rather than a pixel guess.

## Before and after

Before, a help article sat in a full-width container on a 1440px screen. Lines ran to about 180 characters and readers lost their place.

After, the article is constrained to \`max-width: 65ch\` and centred, with the sidebar using the remaining space. Same content, noticeably easier to read, and the page looks more considered.

## Line height scales the other way

Small text needs generous line height; large text needs less. A single \`line-height: 1.5\` on everything makes headings look loose and disconnected.

\`\`\`css
body { line-height: 1.5; }
h1, h2 { line-height: 1.15; }
.caption { line-height: 1.4; }
\`\`\`

Use unitless values so line height scales with the element's own font size instead of inheriting a fixed pixel value from a parent.

## Rhythm between blocks

Vertical rhythm is the spacing between paragraphs, headings and lists. Two simple rules cover most cases:

- Put more space above a heading than below it, so it attaches to the content it introduces.
- Keep paragraph spacing roughly equal to one line of body text.

\`\`\`css
.prose > * + * { margin-top: 1em; }
.prose h2 { margin-top: 2em; }
\`\`\`

The \`* + *\` selector adds space only between siblings, so there is no stray margin at the top of the container.

## Interface text is different

Labels, buttons and table cells are single lines, so measure rarely applies. What matters there is a consistent line height so that text and icons align. A common approach is to set a fixed line height per step, for example 16px text on a 24px line, which also lands neatly on an 8 point grid.

## Takeaways

- Cap running text at about 65ch.
- Tighten line height as text gets larger, and use unitless values.
- Space above headings should be larger than space below.`,
            quiz: [
              {
                id: "q1",
                question: "What does max-width: 65ch do for a block of text?",
                options: [
                  "Limits the block to 65 words",
                  "Limits lines to roughly 65 characters of the current font",
                  "Sets the font size to 65 percent",
                  "Prevents text from wrapping",
                ],
                correctIndex: 1,
                explanation:
                  "ch is based on the width of the 0 glyph, so 65ch gives a measure of about 65 characters in that typeface.",
              },
              {
                id: "q2",
                question: "How should line height change as font size increases?",
                options: [
                  "It should increase proportionally",
                  "It should stay at 1.5 for consistency",
                  "It should get tighter",
                  "It should switch to pixel values",
                ],
                correctIndex: 2,
                explanation:
                  "Large text already has visible space between lines. A tighter ratio keeps headings compact and connected.",
              },
            ],
          },
        ],
      },
      {
        title: "Hierarchy in text",
        description: "Weight and colour do more of the work than size.",
        lessons: [
          {
            title: "Weight, colour and contrast in text",
            slug: "weight-colour-and-contrast-in-text",
            summary:
              "Create text hierarchy with weight and neutral colours while keeping every level readable.",
            isFreePreview: false,
            durationSeconds: 676,
            muxPlaybackId: DEMO_MUX_PLAYBACK_ID,
            markdownContent: `# Weight, colour and contrast in text

Once you have a type scale, the temptation is to use size for every distinction. In interfaces, where space is tight, weight and colour are often the better tools.

## Two or three weights

Most products need regular (400) for body, medium or semibold (500 to 600) for labels and emphasis, and bold (700) for a few headings. Loading five weights costs bandwidth and invites inconsistency.

If you use a variable font, you can pick any weight on its axis, but the same discipline applies: name a few and use them.

## Neutrals for secondary text

A short set of neutral text colours gives you hierarchy without any change in size:

\`\`\`css
:root {
  --text-strong: #171717;
  --text-default: #404040;
  --text-muted: #737373;
}
\`\`\`

On a white background, #737373 has a contrast ratio of about 4.7 to 1, which passes the WCAG AA requirement of 4.5 to 1 for normal text. Lighter greys often look elegant in a mockup and fail in practice. Check every text colour against its real background, including hover and disabled states that people still need to read.

## Before and after

Before, a table used 14px bold for column headers, 14px regular for cells and 12px light grey (#A3A3A3) for timestamps. The timestamps were hard to read and failed contrast.

After:

\`\`\`css
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
\`\`\`

Headers step back through colour and gain clarity through weight. Timestamps are the same size as the cells and readable, but clearly secondary. Tabular numerals keep digits the same width so columns of numbers line up.

## Do not rely on colour alone

If the only difference between an error message and normal text is that it is red, some people will not see the difference. Pair colour with an icon, a label such as "Error:" or a change in weight.

## Letter spacing

Small uppercase labels benefit from a little extra tracking, around 0.04em to 0.08em. Large headings often look better with slightly negative tracking, around -0.01em to -0.02em. Body text should usually be left alone.

## Takeaways

- Use two or three weights and a few neutral text colours.
- Check every text colour for contrast against its real background.
- Never let colour be the only signal of meaning.`,
            quiz: [
              {
                id: "q1",
                question:
                  "What is the WCAG AA minimum contrast ratio for normal body text?",
                options: ["3 to 1", "4.5 to 1", "7 to 1", "2.5 to 1"],
                correctIndex: 1,
                explanation:
                  "AA requires 4.5 to 1 for normal text. 3 to 1 applies to large text and to non-text UI components.",
              },
              {
                id: "q2",
                question: "Why use font-variant-numeric: tabular-nums in a table?",
                options: [
                  "It makes numbers bold",
                  "It gives each digit the same width so columns align",
                  "It converts numbers to old-style figures",
                  "It improves screen reader pronunciation",
                ],
                correctIndex: 1,
                explanation:
                  "Proportional digits vary in width. Tabular figures line up vertically, which makes numbers easy to compare.",
              },
              {
                id: "q3",
                question:
                  "An error is shown only by turning the text red. What is missing?",
                options: [
                  "A larger font size",
                  "A second signal such as an icon or an Error label",
                  "An animation to draw attention",
                  "A darker shade of red",
                ],
                correctIndex: 1,
                explanation:
                  "Colour alone excludes people who cannot distinguish it. A second cue makes the meaning available to everyone.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "accessible-components",
    title: "Accessible components",
    subtitle:
      "Focus, semantics and labels: the details that decide whether a component works for everyone.",
    description:
      "Accessibility is mostly built into small, repeatable decisions inside components. This course covers visible focus, choosing the right element, and labelling forms and errors so assistive technology can announce them. You will fix real component code and learn how to test it with a keyboard and a screen reader.",
    thumbnailUrl: "/courses/accessible-components.svg",
    category: "Frontend standards",
    level: "intermediate",
    tier: "pro",
    featured: false,
    estimatedHours: 3,
    tags: ["Accessibility", "Focus", "Forms", "React"],
    modules: [
      {
        title: "Keyboard and semantics",
        description:
          "Make every control reachable, visible and correctly described.",
        lessons: [
          {
            title: "Focus states people can see",
            slug: "focus-states-people-can-see",
            summary:
              "Design focus rings that are visible on every background and only appear when they help.",
            isFreePreview: true,
            durationSeconds: 640,
            muxPlaybackId: DEMO_MUX_PLAYBACK_ID,
            markdownContent: `# Focus states people can see

Keyboard users move through an interface one focusable element at a time. The focus indicator is their cursor. Removing it, or making it too faint to see, is like hiding the mouse pointer.

## The classic mistake

\`\`\`css
/* Before */
button:focus {
  outline: none;
}
\`\`\`

This line usually arrives because a designer disliked the ring that appeared after a mouse click. It fixes that complaint and breaks keyboard navigation for everyone.

## Use focus-visible

Browsers decide when focus should be shown. \`:focus-visible\` matches when the user is navigating with a keyboard, and generally not after a mouse click on a button.

\`\`\`css
/* After */
button:focus-visible {
  outline: 2px solid #14b8a6;
  outline-offset: 2px;
}
\`\`\`

You get a clear ring for keyboard users and no ring after a click. Text inputs still show focus on click, because people need to know where they are typing.

## Make it visible everywhere

A focus indicator should have at least 3 to 1 contrast against the colours around it. A teal ring that works on white may disappear on a teal button. Two techniques help:

- **Offset the outline** so it sits on the page background rather than on the component.
- **Use a double ring** for components that appear on varied backgrounds.

\`\`\`css
.button:focus-visible {
  outline: 2px solid #171717;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px #ffffff;
}
\`\`\`

Prefer \`outline\` over \`box-shadow\` alone. Outlines remain visible in Windows high contrast mode, where box shadows are removed.

## Focus order and focus management

Focus should move in the same order as the visual layout. If you reorder items with CSS grid or \`order\`, the DOM order still controls tabbing, so the two can drift apart.

When content changes, move focus deliberately:

- Opening a dialog moves focus into it; closing it returns focus to the control that opened it.
- Deleting a row moves focus to a sensible neighbour rather than dropping it on the page body.

A well-built dialog component handles this for you, which is one reason to use a tested primitive rather than building your own.

## How to test

Unplug the mouse, or simply stop touching it. Press Tab through the page. At every stop, ask: can I see where I am, and is this where I expected to be?

## Takeaways

- Never remove focus styles without replacing them.
- Use \`:focus-visible\`, an outline and an offset.
- Keep focus order aligned with visual order, and manage focus when content changes.`,
            quiz: [
              {
                id: "q1",
                question:
                  "What does :focus-visible do differently from :focus on a button?",
                options: [
                  "It never matches on buttons",
                  "It matches when the browser decides focus should be shown, typically keyboard navigation",
                  "It only matches inside dialogs",
                  "It adds a default teal outline",
                ],
                correctIndex: 1,
                explanation:
                  "Browsers apply heuristics so :focus-visible matches for keyboard focus but usually not after a mouse click on a button.",
              },
              {
                id: "q2",
                question: "Why prefer outline over box-shadow for focus rings?",
                options: [
                  "Outlines support rounded corners and shadows do not",
                  "Outlines remain visible in forced colours modes where shadows are removed",
                  "Box shadows cannot use custom colours",
                  "Outlines take up layout space, which prevents overlap",
                ],
                correctIndex: 1,
                explanation:
                  "Forced colours modes such as Windows high contrast strip box shadows, so a shadow-only ring can vanish completely.",
              },
              {
                id: "q3",
                question: "Where should focus go when a dialog closes?",
                options: [
                  "To the top of the page",
                  "To the first link in the navigation",
                  "Back to the control that opened the dialog",
                  "Nowhere; the browser handles it",
                ],
                correctIndex: 2,
                explanation:
                  "Returning focus to the trigger keeps the person's place, so they can continue from where they were.",
              },
            ],
          },
          {
            title: "Buttons, links and the right element",
            slug: "buttons-links-and-the-right-element",
            summary:
              "Choose between button and link by what the control does, and get keyboard support for free.",
            isFreePreview: false,
            durationSeconds: 582,
            muxPlaybackId: DEMO_MUX_PLAYBACK_ID,
            markdownContent: `# Buttons, links and the right element

Most accessibility bugs in components come from using the wrong element and then trying to patch the difference with attributes. Start with the right element and much of the work disappears.

## The rule

- **A link goes somewhere.** It changes the URL, opens a new page or jumps to a section. Use \`<a href>\`.
- **A button does something.** It submits, opens, toggles, deletes or saves. Use \`<button>\`.

Styling is a separate question. A button can look like a link and a link can look like a button. What matters is what happens when it is activated.

## Before and after

Before:

\`\`\`tsx
<div className="btn" onClick={save}>
  Save changes
</div>
\`\`\`

This looks fine with a mouse. With a keyboard it cannot be reached by Tab, does not respond to Enter or Space, and a screen reader announces it as plain text.

After:

\`\`\`tsx
<button type="button" className="btn" onClick={save}>
  Save changes
</button>
\`\`\`

One element change gives you focusability, Enter and Space activation, the button role and correct behaviour in forms. Adding \`role="button"\` and \`tabIndex={0}\` to the div would still leave you writing key handlers by hand, and it is easy to get subtly wrong.

## Inside forms

A \`<button>\` inside a form defaults to \`type="submit"\`. A "Cancel" or "Add another" button without \`type="button"\` will submit the form unexpectedly. Set the type explicitly on every button that is not the submit action.

## Icon-only buttons need names

A button that contains only an icon has no accessible name unless you give it one:

\`\`\`tsx
<button type="button" aria-label="Close dialog">
  <XIcon aria-hidden="true" />
</button>
\`\`\`

Hide the icon from assistive technology with \`aria-hidden\` so it is not announced twice or as a meaningless graphic.

## Links that make sense alone

Screen reader users often pull up a list of all links on a page. A list of five "Read more" links is useless. Write link text that describes the destination, such as "Read the typography lesson", or add visually hidden text that completes it.

## Disabled buttons

A disabled button cannot be focused, so people using a keyboard may not discover it or learn why it is unavailable. When the reason matters, consider keeping the button enabled and showing a clear message on activation, or using \`aria-disabled="true"\` with explanatory text nearby.

## Takeaways

- Links navigate, buttons act. Pick the element by behaviour, not appearance.
- Set \`type="button"\` on non-submit buttons in forms.
- Give icon-only buttons an accessible name and write link text that stands alone.`,
            quiz: [
              {
                id: "q1",
                question:
                  "A control opens a settings panel on the same page without changing the URL. Which element fits?",
                options: [
                  "<a href=\"#\">",
                  "<button type=\"button\">",
                  "<div role=\"link\">",
                  "<span tabindex=\"0\">",
                ],
                correctIndex: 1,
                explanation:
                  "It performs an action rather than navigating, so it is a button. An href of # is a common workaround that misleads assistive technology.",
              },
              {
                id: "q2",
                question:
                  "A Cancel button inside a form keeps submitting the form. What is the likely cause?",
                options: [
                  "The form is missing a method attribute",
                  "Buttons inside forms default to type submit",
                  "The onClick handler is async",
                  "The button needs an aria-label",
                ],
                correctIndex: 1,
                explanation:
                  "Without an explicit type, a button in a form is a submit button. Setting type to button fixes it.",
              },
            ],
          },
        ],
      },
      {
        title: "Forms people can complete",
        description: "Labels, hints and errors that assistive technology announces.",
        lessons: [
          {
            title: "Labelling forms and errors",
            slug: "labelling-forms-and-errors",
            summary:
              "Connect labels, hints and error messages to their inputs so everyone knows what to enter and what went wrong.",
            isFreePreview: false,
            durationSeconds: 735,
            muxPlaybackId: DEMO_MUX_PLAYBACK_ID,
            markdownContent: `# Labelling forms and errors

Forms are where interfaces ask people for effort. Every unclear label or silent error costs them time, and for screen reader users an unlabelled field can be a dead end.

## Placeholders are not labels

Before:

\`\`\`html
<input type="email" placeholder="Email address" />
\`\`\`

The placeholder vanishes as soon as someone starts typing, it usually has low contrast, and many screen readers do not treat it as a reliable name. After:

\`\`\`html
<label for="email">Email address</label>
<input id="email" type="email" autocomplete="email" />
\`\`\`

A visible label stays put, clicking it focuses the input, and assistive technology announces it. The \`autocomplete\` attribute lets browsers and password managers fill the field, which helps everyone and especially people with motor or memory impairments.

## Hints

Format requirements belong in a hint connected to the input, not hidden in a tooltip:

\`\`\`html
<label for="password">Password</label>
<p id="password-hint">At least 12 characters.</p>
<input id="password" type="password" aria-describedby="password-hint" />
\`\`\`

\`aria-describedby\` makes the hint part of what is announced when the field receives focus.

## Errors that can be found

A good error message says what went wrong and how to fix it, appears next to the field and is connected to it.

\`\`\`tsx
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
\`\`\`

\`aria-invalid\` tells assistive technology the field has a problem, and \`aria-describedby\` reads the message. Write the message as an instruction: "Enter an email address like name@example.com" is more useful than "Invalid input".

## After submit

When a form with several errors is submitted, move focus to a summary at the top that lists each error as a link to its field. People using a screen reader then hear that something went wrong straight away, and everyone gets a quick way to jump to each problem.

## Grouping

Related controls, such as a set of radio buttons, belong in a \`<fieldset>\` with a \`<legend>\`. The legend is announced with each option, so "Delivery speed, Standard" makes sense on its own.

## Takeaways

- Every input needs a visible, programmatically connected label.
- Use \`aria-describedby\` for hints and errors, and \`aria-invalid\` when a field fails.
- Write errors as instructions, and give multi-error forms a focused summary.`,
            quiz: [
              {
                id: "q1",
                question: "Why is a placeholder a poor replacement for a label?",
                options: [
                  "Placeholders cannot be styled",
                  "It disappears when typing starts and is not a reliable accessible name",
                  "Placeholders slow down form submission",
                  "Browsers ignore placeholders on email inputs",
                ],
                correctIndex: 1,
                explanation:
                  "Once text is entered the placeholder is gone, so people lose the prompt, and many assistive technologies do not use it as the field's name.",
              },
              {
                id: "q2",
                question:
                  "Which attribute connects an error message so it is announced with the input?",
                options: [
                  "aria-label",
                  "aria-describedby",
                  "aria-live on the input",
                  "title",
                ],
                correctIndex: 1,
                explanation:
                  "aria-describedby points to the id of the message, so it is read as the field's description when focused.",
              },
              {
                id: "q3",
                question: "Which error message is most helpful?",
                options: [
                  "Invalid input",
                  "Error 422",
                  "Enter an email address like name@example.com",
                  "Something went wrong",
                ],
                correctIndex: 2,
                explanation:
                  "A helpful error explains how to fix the problem, not just that one exists.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "design-systems-and-tokens",
    title: "Design systems & tokens",
    subtitle:
      "Turn scattered values into tokens that designers and engineers share, then theme them without rewrites.",
    description:
      "A design system starts with agreeing on values. This course shows how to extract hard-coded colours and spacing into primitive tokens, layer semantic tokens on top and use them to support light and dark themes with CSS custom properties. It is practical, code-first and sized for a real product team.",
    thumbnailUrl: "/courses/design-systems-and-tokens.svg",
    category: "Design systems",
    level: "intermediate",
    tier: "pro",
    featured: false,
    estimatedHours: 2,
    tags: ["Design tokens", "CSS custom properties", "Theming", "Design systems"],
    modules: [
      {
        title: "Tokens in practice",
        description:
          "From a pile of hex codes to a layered token set that supports themes.",
        lessons: [
          {
            title: "From hard-coded values to tokens",
            slug: "from-hard-coded-values-to-tokens",
            summary:
              "Audit the values in a codebase and consolidate them into a small set of primitive tokens.",
            isFreePreview: true,
            durationSeconds: 702,
            muxPlaybackId: DEMO_MUX_PLAYBACK_ID,
            markdownContent: `# From hard-coded values to tokens

A design token is a named design decision: a colour, a spacing step, a radius, a duration. Tokens let designers and engineers refer to the same decision by the same name, so changing it in one place changes it everywhere.

## Start with an audit

Before naming anything, find out what is actually in use. A quick search of a stylesheet or component folder for hex codes and pixel values is usually revealing:

\`\`\`bash
grep -rhoE "#[0-9a-fA-F]{6}" src | sort | uniq -c | sort -rn
\`\`\`

It is common to find a dozen greys where three were intended, and borders in #E4E4E4, #E5E5E5 and #E6E6E6 that nobody can tell apart. Each near-duplicate is a decision someone made without a shared reference.

## Consolidate into primitives

Primitive tokens describe raw values with neutral names. They form your palette and scales:

\`\`\`css
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
\`\`\`

Map every audited value to its nearest primitive. The three almost-identical borders all become \`--neutral-200\`. If a value has no sensible home, ask whether it is a real need or an accident.

## Before and after

Before:

\`\`\`css
.card {
  background: #fff;
  border: 1px solid #e4e4e4;
  border-radius: 7px;
  padding: 15px;
}
\`\`\`

After:

\`\`\`css
.card {
  background: var(--neutral-0);
  border: 1px solid var(--neutral-200);
  border-radius: var(--radius-2);
  padding: var(--space-4);
}
\`\`\`

The card looks almost identical, but now it moves with the system. Change \`--radius-2\` and every card, input and menu that uses it follows.

## One source, many outputs

Teams often keep tokens in a JSON file and generate CSS, Tailwind configuration and design tool variables from it. That is worth doing once more than one platform consumes the tokens. For a single web app, CSS custom properties in one file are a fine source of truth.

## Takeaways

- Audit what is in use before you design a token set.
- Primitive tokens name raw values; map every existing value to one.
- Keep a single source of truth, and generate other formats only when you need them.`,
            quiz: [
              {
                id: "q1",
                question: "What is a primitive token?",
                options: [
                  "A token that only works in one component",
                  "A named raw value such as a palette colour or spacing step",
                  "A token that describes a purpose like danger or surface",
                  "A JavaScript constant exported from a component",
                ],
                correctIndex: 1,
                explanation:
                  "Primitives name the raw palette and scales. Purpose-based names come in the semantic layer built on top.",
              },
              {
                id: "q2",
                question:
                  "An audit finds borders in #E4E4E4, #E5E5E5 and #E6E6E6. What should you do?",
                options: [
                  "Create three tokens so nothing changes visually",
                  "Map all three to one neutral primitive",
                  "Leave them, since tokens only cover brand colours",
                  "Replace them with transparent borders",
                ],
                correctIndex: 1,
                explanation:
                  "The values are indistinguishable and were never intentional differences. Consolidating them is the point of the audit.",
              },
            ],
          },
          {
            title: "Semantic tokens and theming",
            slug: "semantic-tokens-and-theming",
            summary:
              "Name tokens by purpose so components stay the same while themes swap the values underneath.",
            isFreePreview: false,
            durationSeconds: 768,
            muxPlaybackId: DEMO_MUX_PLAYBACK_ID,
            markdownContent: `# Semantic tokens and theming

Primitive tokens tell you what a value is. Semantic tokens tell you what it is for. That second layer is what makes theming, rebrands and dark mode manageable.

## Why primitives are not enough

If a button uses \`var(--teal-500)\` directly, dark mode means finding every component that uses teal and deciding, one by one, what it should become. The component knows too much about the palette.

A semantic token describes the role instead:

\`\`\`css
:root {
  --color-surface: var(--neutral-0);
  --color-surface-subtle: var(--neutral-100);
  --color-border: var(--neutral-200);
  --color-text: var(--neutral-900);
  --color-text-muted: var(--neutral-500);
  --color-accent: var(--teal-500);
  --color-focus: var(--teal-500);
}
\`\`\`

Components use only semantic tokens. Primitives are referenced only inside the token layer.

## Theming by swapping the mapping

Dark mode becomes a new mapping, not a new set of components:

\`\`\`css
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
  /* ...the same mapping as above */
}
\`\`\`

The media query follows the operating system, and the \`data-theme\` attribute lets a person override it. Note the accent shifts to a lighter teal in dark mode so it keeps enough contrast against a dark surface.

## Before and after

Before, a badge hard-coded its colours and needed a separate \`.badge-dark\` class:

\`\`\`css
.badge { background: #f5f5f5; color: #171717; }
.dark .badge-dark { background: #262626; color: #fff; }
\`\`\`

After, the badge has one rule and works in both themes:

\`\`\`css
.badge {
  background: var(--color-surface-subtle);
  color: var(--color-text);
}
\`\`\`

## Naming that lasts

Good semantic names describe role and, when needed, state: \`--color-text-muted\`, \`--color-border-strong\`, \`--color-accent-hover\`. Avoid names that describe appearance, like \`--color-light-grey\`, because the name stops making sense the moment the theme changes.

Keep the semantic layer small. If you find yourself creating \`--color-settings-page-card-border\`, a component-level variable inside that component is a better home.

## Takeaways

- Components consume semantic tokens; only the token layer touches primitives.
- Themes are alternate mappings from semantic to primitive values.
- Name by role and state, not by appearance, and keep the layer small.`,
            quiz: [
              {
                id: "q1",
                question:
                  "Why should components reference semantic tokens instead of primitives?",
                options: [
                  "Semantic tokens load faster",
                  "Themes can change the mapping without editing components",
                  "Primitives cannot be used with var()",
                  "Semantic tokens are required by CSS custom properties",
                ],
                correctIndex: 1,
                explanation:
                  "With a semantic layer, dark mode or a rebrand changes what each role points to, and components stay untouched.",
              },
              {
                id: "q2",
                question:
                  "Which semantic token name is most likely to age well?",
                options: [
                  "--color-light-grey",
                  "--color-teal-text",
                  "--color-text-muted",
                  "--color-settings-card-border-v2",
                ],
                correctIndex: 2,
                explanation:
                  "It describes a role that holds in any theme. Appearance-based names break when values change, and overly specific names bloat the layer.",
              },
              {
                id: "q3",
                question:
                  "Why does the accent switch to a lighter teal in dark mode?",
                options: [
                  "To match the brand guidelines for print",
                  "To keep enough contrast against the dark surface",
                  "Because darker colours are not supported in dark mode",
                  "To reduce battery usage on OLED screens",
                ],
                correctIndex: 1,
                explanation:
                  "A colour that contrasts well with white may be too dark against a near-black surface, so the dark theme maps the role to a lighter step.",
              },
            ],
          },
        ],
      },
    ],
  },
];

async function runSeed(ctx: MutationCtx) {
  let createdCourses = 0;
  let createdModules = 0;
  let createdLessons = 0;
  const now = Date.now();

  for (let cIdx = 0; cIdx < SEED_COURSES.length; cIdx++) {
    const courseData = SEED_COURSES[cIdx];
    const existing = await ctx.db
      .query("courses")
      .withIndex("by_slug", (q) => q.eq("slug", courseData.slug))
      .unique();
    if (existing) continue;

    const courseId = await ctx.db.insert("courses", {
      slug: courseData.slug,
      title: courseData.title,
      subtitle: courseData.subtitle,
      description: courseData.description,
      thumbnailUrl: courseData.thumbnailUrl,
      category: courseData.category,
      level: courseData.level,
      tier: courseData.tier,
      published: true,
      featured: courseData.featured,
      estimatedHours: courseData.estimatedHours,
      tags: courseData.tags,
      tutorName: "Teddy",
      tutorTitle: "Frontend engineer and instructor",
      order: cIdx,
      createdAt: now,
      updatedAt: now,
    });
    createdCourses++;

    for (let mIdx = 0; mIdx < courseData.modules.length; mIdx++) {
      const modData = courseData.modules[mIdx];
      const moduleId = await ctx.db.insert("modules", {
        courseId,
        title: modData.title,
        description: modData.description,
        order: mIdx,
        createdAt: now,
        updatedAt: now,
      });
      createdModules++;

      for (let lIdx = 0; lIdx < modData.lessons.length; lIdx++) {
        const lessonData = modData.lessons[lIdx];
        await ctx.db.insert("lessons", {
          courseId,
          moduleId,
          title: lessonData.title,
          slug: lessonData.slug,
          summary: lessonData.summary,
          order: lIdx,
          isFreePreview: lessonData.isFreePreview,
          durationSeconds: lessonData.durationSeconds,
          markdownContent: lessonData.markdownContent,
          muxPlaybackId: lessonData.muxPlaybackId,
          muxStatus: "ready",
          quiz: lessonData.quiz,
          createdAt: now,
          updatedAt: now,
        });
        createdLessons++;
      }
    }
  }

  return { createdCourses, createdModules, createdLessons };
}

export const seedCourses = internalMutation({
  args: {},
  handler: async (ctx) => {
    return await runSeed(ctx);
  },
});

export const seedSampleCoursesAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await runSeed(ctx);
  },
});

const RESET_TABLES = [
  "quizAttempts",
  "lessonProgress",
  "enrollments",
  "lessons",
  "modules",
  "courses",
] as const;

export const resetContent = internalMutation({
  args: {},
  handler: async (ctx) => {
    // ponytail: single transaction, fine for the small dev dataset; batch via scheduler if tables grow.
    for (const table of RESET_TABLES) {
      while (true) {
        const rows = await ctx.db.query(table).take(500);
        if (rows.length === 0) break;
        for (const row of rows) await ctx.db.delete(table, row._id);
      }
    }
    return await runSeed(ctx);
  },
});
