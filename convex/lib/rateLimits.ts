import { HOUR, MINUTE, RateLimiter } from "@convex-dev/rate-limiter";
import { components } from "../_generated/api";

/**
 * Abuse limits. Per-user limits are keyed by tokenIdentifier and sized well above
 * normal use, so learners never notice them; they stop scripts and runaway costs.
 */
export const rateLimiter = new RateLimiter(components.rateLimiter, {
  // Paid LLM call per tutor message: ~1 every 2 minutes sustained, bursts of 10.
  tutorMessage: { kind: "token bucket", rate: 30, period: HOUR, capacity: 10 },
  // Ceiling on total tutor spend across every user.
  tutorGlobal: { kind: "fixed window", rate: 600, period: HOUR, shards: 4 },
  // Quiz submissions per user.
  quizAttempt: { kind: "token bucket", rate: 10, period: MINUTE, capacity: 5 },
  // Progress, enrolment, tracking and settings writes per user.
  progressWrite: { kind: "token bucket", rate: 60, period: MINUTE, capacity: 30 },
});
