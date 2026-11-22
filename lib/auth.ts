export const PRO_PLAN_SLUG = "pro";

export const PRO_PLAN_ID =
  process.env.NEXT_PUBLIC_CLERK_PRO_PLAN_ID ??
  "cplan_3MMnVBY7M2i9cGKZO0o0i4Br9uq";

export const TUTOR = {
  name: "Teddy",
  handle: "ted.code",
  role: "Frontend engineer and instructor",
  url: "https://frontendted.co.za/",
  bio: "I build web apps for a living and teach the way I learned: by shipping something real. Every Vukora course is a working project you build alongside me, from the first file to deploy.",
} as const;

export function isAdminRole(metadata: unknown): boolean {
  if (!metadata || typeof metadata !== "object") return false;
  const record = metadata as Record<string, unknown>;
  return record.role === "admin";
}
