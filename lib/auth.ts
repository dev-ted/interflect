export const PRO_PLAN_SLUG = "pro";

export const PRO_PLAN_ID =
  process.env.NEXT_PUBLIC_CLERK_PRO_PLAN_ID ??
  "cplan_3MMnVBY7M2i9cGKZO0o0i4Br9uq";

export const TUTOR = {
  name: "Teddy",
  handle: "ted.code",
  nickname: "10xdev",
  role: "Software engineer",
  avatar: "/teddy.webp",
  url: "https://frontendted.co.za/",
  tagline: "Crafting digital experiences.",
  bio: "I build interfaces that feel good to use, and I've broken plenty along the way so you don't have to. Interflect is where I share the tricks, the lessons and the occasional “why is this div 3px off?” moment, so you can level up as a UI developer too.",
} as const;

export function isAdminRole(metadata: unknown): boolean {
  if (!metadata || typeof metadata !== "object") return false;
  const record = metadata as Record<string, unknown>;
  return record.role === "admin";
}
