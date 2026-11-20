import { defineTool } from "eve/tools";
import { z } from "zod";
import { fetchCatalogSnapshot } from "../lib/convex";

export default defineTool({
  description:
    "Fetch the full markdown content, summary, and details of a specific course lesson by its courseSlug and lessonSlug.",
  inputSchema: z.object({
    courseSlug: z.string().min(1).describe("The course slug, e.g. 'nextjs-fullstack-ai'"),
    lessonSlug: z.string().min(1).describe("The lesson slug within the course"),
  }),
  label: {
    start: ({ lessonSlug }) => `Read lesson ${lessonSlug}`,
  },
  async execute({ courseSlug, lessonSlug }) {
    const snapshot = await fetchCatalogSnapshot({ courseSlug, lessonSlug });
    if (!snapshot.activeLesson) {
      return {
        found: false,
        error: `Lesson "${lessonSlug}" in course "${courseSlug}" was not found.`,
      };
    }
    return {
      found: true,
      lesson: snapshot.activeLesson,
    };
  },
});
