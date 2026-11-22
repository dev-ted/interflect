export const PRO_PLAN_SLUG = "pro";

export const PRO_PLAN_ID =
  process.env.NEXT_PUBLIC_CLERK_PRO_PLAN_ID ??
  "cplan_3MMnVBY7M2i9cGKZO0o0i4Br9uq";

export const TUTOR = {
  name: "Teddy",
  handle: "ted.code",
  role: "Frontend engineer and instructor",
  url: "https://frontendted.co.za/",
  bio: "I teach UI/UX design and frontend craft by building and critiquing real interfaces with you. Every Interflect course is a hands-on project, so you finish with work you can show.",
} as const;

export function isAdminRole(metadata: unknown): boolean {
  if (!metadata || typeof metadata !== "object") return false;
  const record = metadata as Record<string, unknown>;
  return record.role === "admin";
}
