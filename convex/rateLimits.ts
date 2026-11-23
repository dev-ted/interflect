import { mutation } from "./_generated/server";
import { requireIdentity } from "./lib/auth";
import { rateLimiter } from "./lib/rateLimits";

/** Called by the tutor API route before each paid model call. */
export const consumeTutorMessage = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const mine = await rateLimiter.limit(ctx, "tutorMessage", { key: identity.tokenIdentifier });
    if (!mine.ok) return { ok: false as const, retryAfter: mine.retryAfter };
    const everyone = await rateLimiter.limit(ctx, "tutorGlobal");
    if (!everyone.ok) {
      // Don't charge the learner for a request the global cap refused.
      await rateLimiter.credit(ctx, "tutorMessage", { key: identity.tokenIdentifier });
      return { ok: false as const, retryAfter: everyone.retryAfter };
    }
    return { ok: true as const, retryAfter: 0 };
  },
});
