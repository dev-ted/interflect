import { defineTool } from "eve/tools";
import { z } from "zod";
import { fetchUserProgressForAgent } from "../lib/convex";

export default defineTool({
  description:
    "Fetch the authenticated learner's enrolled courses, completed lessons, total completed count, and next recommended lesson per course.",
  inputSchema: z.object({}),
  label: {
    start: () => "Check learning progress",
  },
  async execute(_input, ctx) {
    const clerkToken = ctx.session.auth.current?.attributes?.clerkToken;
    if (typeof clerkToken !== "string" || clerkToken.length === 0) {
      return {
        authenticated: false,
        enrolledCourses: [],
        totalCompletedLessons: 0,
        message: "No authenticated Clerk token was available for this session.",
      };
    }

    const progress = await fetchUserProgressForAgent(clerkToken);
    if (!progress) {
      return {
        authenticated: false,
        enrolledCourses: [],
        totalCompletedLessons: 0,
        message: "Could not resolve learner progress from Convex.",
      };
    }

    return {
      authenticated: true,
      enrolledCourses: progress.enrolledCourses,
      totalCompletedLessons: progress.totalCompletedLessons,
    };
  },
});
