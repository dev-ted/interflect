# Lesson scripts for the seeded courses

These files are the lesson-script package from the course-creator skill (phase 3 only). They do not include video, audio, or slides.

Each lesson already exists in `convex/seed.ts`. The script restates that lesson as a recording brief: what to say, what to show, and how long the finished video should run. Hand a file to a person or to a separate video tool. This package stops at the script.

## How to use a script

1. Open the lesson file.
2. Paste the **Narration only** section into a voice tool, or read it yourself.
3. Follow **On screen** for slides, a code editor, or a browser. The duration does not add time for those holds.
4. Keep the quiz and activity as end cards or as the existing lesson page. They are not part of the voiceover.

The duration on each script is the full **Say** narration, counted as whitespace-separated words and divided by 130 words per minute. Each section is rounded to the nearest second on its own, so the section times can differ from the lesson total by a second. The narration-only block is a shorter cut and has its own count on the same line. That number is the audio length only.

`durationSeconds` in `convex/seed.ts` is the time to finish the lesson page, not this narration length. Count the written lesson: words outside code fences at 180 per minute, 75 seconds per preview, 45 seconds for another code fence under 15 lines (75 if longer), and 40 seconds per quiz question. Round the lesson to the nearest minute. The course card shows the sum of those lesson times.

Voice: practical, second person, calm. Tutor name in the product is Teddy. Prices in examples use South African rand (R50).

## Courses

| Course | Lessons | Folder |
| --- | --- | --- |
| Visual hierarchy & layout | 3 | `03-lessons/visual-hierarchy-and-layout/` |
| Typography for interfaces | 3 | `03-lessons/typography-for-interfaces/` |
| Accessible components | 3 | `03-lessons/accessible-components/` |
| Design systems & tokens | 2 | `03-lessons/design-systems-and-tokens/` |

Also in `03-lessons/`: `companion-materials-list.md`, `discussion-prompts.md`.
