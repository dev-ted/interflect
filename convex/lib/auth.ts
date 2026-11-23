import type { ActionCtx, MutationCtx, QueryCtx } from "../_generated/server";
import type { UserIdentity } from "convex/server";
import { PRO_ENABLED } from "./features";

type AuthCtx = QueryCtx | MutationCtx | ActionCtx;

export async function getOptionalIdentity(
  ctx: AuthCtx,
): Promise<UserIdentity | null> {
  return await ctx.auth.getUserIdentity();
}

export async function requireIdentity(ctx: AuthCtx): Promise<UserIdentity> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Authentication required.");
  }
  return identity;
}

export function isAdminIdentity(identity: UserIdentity | null): boolean {
  if (!identity) return false;
  const record = identity as Record<string, unknown>;
  if (record.role === "admin") return true;
  const meta =
    (record.metadata as Record<string, unknown> | undefined) ??
    (record.publicMetadata as Record<string, unknown> | undefined) ??
    (record.public_metadata as Record<string, unknown> | undefined);
  return Boolean(meta && meta.role === "admin");
}

export function isProIdentity(identity: UserIdentity | null): boolean {
  if (!identity) return false;
  if (!PRO_ENABLED) return true;
  if (isAdminIdentity(identity)) return true;
  const record = identity as Record<string, unknown>;
  const pla = typeof record.pla === "string" ? record.pla : "";
  const fea = typeof record.fea === "string" ? record.fea : "";
  if (pla.split(",").some((p) => p === "u:pro" || p === "pro")) return true;
  if (
    fea
      .split(",")
      .some((f) => f === "u:pro_courses" || f === "pro_courses" || f === "u:vukora_ai")
  ) {
    return true;
  }
  return false;
}

export async function requireAdmin(ctx: AuthCtx): Promise<UserIdentity> {
  const identity = await requireIdentity(ctx);
  if (!isAdminIdentity(identity)) {
    throw new Error("Admin access required.");
  }
  return identity;
}
