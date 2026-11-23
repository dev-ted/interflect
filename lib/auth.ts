export const PRO_PLAN_SLUG = "pro";

export const PRO_PLAN_ID =
  process.env.NEXT_PUBLIC_CLERK_PRO_PLAN_ID ??
  "cplan_3MMnVBY7M2i9cGKZO0o0i4Br9uq";

export const TUTOR = {
  name: "Teddy",
  handle: "ted.code",
  role: "Software developer",
  url: "https://frontendted.co.za/",
  tagline: "A software developer who crafts beautiful, responsive and engaging digital experiences.",
  bio: "Interflect is where I share what I have learned over the years, and what I keep learning every day, so you can become a better UI developer too.",
} as const;

export function isAdminRole(metadata: unknown): boolean {
  if (!metadata || typeof metadata !== "object") return false;
  const record = metadata as Record<string, unknown>;
  return record.role === "admin";
}
