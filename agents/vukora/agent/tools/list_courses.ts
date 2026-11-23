import { defineTool } from "eve/tools";
import { z } from "zod";
import { fetchCatalogSnapshot } from "../lib/convex";

export default defineTool({
  description:
    "List all published courses in Interflect along with their modules, lessons, tiers, levels, and how long each lesson takes to finish.",
  inputSchema: z.object({}),
  label: {
    start: () => "Browse course catalog",
  },
  async execute() {
    const snapshot = await fetchCatalogSnapshot({});
    return {
      totalCourses: snapshot.courses.length,
      courses: snapshot.courses,
    };
  },
});
