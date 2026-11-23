/**
 * The single switch for the Pro tier. Read by Convex and by the Next.js app.
 *
 * While false, everything is free: public queries report every course as "free",
 * signed-in users get the tutor, and pricing/upgrade UI is hidden. Course tiers are
 * still stored (and editable in the Admin studio), so setting this back to true
 * restores Pro exactly as it was.
 */
export const PRO_ENABLED = false;

/**
 * The Interflect AI tutor. Off until the AI Gateway is connected: hides the chat widget and
 * the landing-page tutor section, and the /api/vukora/chat route refuses requests.
 */
export const TUTOR_ENABLED = false;

/** What learners see: the stored tier while Pro is on, "free" while it is off. */
export function publicCourse<T extends { tier: "free" | "pro" }>(course: T): T {
  return PRO_ENABLED ? course : { ...course, tier: "free" };
}
