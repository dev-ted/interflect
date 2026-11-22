import { defineTool } from "eve/tools";
import { z } from "zod";
import { fetchCatalogSnapshot } from "../lib/convex";

export default defineTool({
  description:
    "List all published courses in Vukora Studio along with their modules, lessons, tiers, levels, and estimated hours.",
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
