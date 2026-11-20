import { auth } from "@clerk/nextjs/server";
import { isAdminRole, PRO_PLAN_SLUG } from "./auth";

export interface ServerAuthContext {
  isAuthenticated: boolean;
  userId: string | null;
  isAdmin: boolean;
  isPro: boolean;
  hasProAccess: boolean;
}

export async function getServerAuthContext(): Promise<ServerAuthContext> {
  const { isAuthenticated, userId, has, sessionClaims } = await auth();

  if (!isAuthenticated || !userId) {
    return {
      isAuthenticated: false,
      userId: null,
      isAdmin: false,
      isPro: false,
      hasProAccess: false,
    };
  }

  const claims = sessionClaims as Record<string, unknown> | null;
  const isAdmin =
    isAdminRole(claims?.metadata) ||
    isAdminRole(claims?.publicMetadata) ||
    claims?.role === "admin";

  const isPro =
    has({ plan: PRO_PLAN_SLUG }) ||
    has({ feature: "pro_courses" }) ||
    has({ feature: "learnly_ai" });

  return {
    isAuthenticated: true,
    userId,
    isAdmin,
    isPro,
    hasProAccess: isPro || isAdmin,
  };
}
