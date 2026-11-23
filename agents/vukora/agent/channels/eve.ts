import { verifyToken } from "@clerk/backend";
import {
  extractBearerToken,
  ForbiddenError,
  localDev,
  vercelOidc,
  withAuthChallenges,
  type AuthFn,
} from "eve/channels/auth";
import { eveChannel } from "eve/channels/eve";
import { PRO_ENABLED } from "../../../../convex/lib/features";

function extractSessionCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    if (trimmed.startsWith("__session=")) {
      const raw = trimmed.slice("__session=".length).trim();
      if (!raw) return null;
      try {
        return decodeURIComponent(raw);
      } catch {
        return raw;
      }
    }
  }
  return null;
}

function splitClaimList(value: unknown): string[] {
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function hasAdminClaim(claims: Record<string, unknown>): boolean {
  if (claims.role === "admin") return true;
  const meta =
    (claims.metadata as Record<string, unknown> | undefined) ??
    (claims.publicMetadata as Record<string, unknown> | undefined) ??
    (claims.public_metadata as Record<string, unknown> | undefined);
  return Boolean(meta && typeof meta === "object" && meta.role === "admin");
}

function hasProClaim(claims: Record<string, unknown>): boolean {
  const plans = splitClaimList(claims.pla);
  if (plans.some((plan) => plan === "u:pro" || plan === "pro")) {
    return true;
  }

  const features = splitClaimList(claims.fea);
  if (
    features.some(
      (feature) =>
        feature === "u:vukora_ai" ||
        feature === "vukora_ai" ||
        feature === "u:pro_courses" ||
        feature === "pro_courses",
    )
  ) {
    return true;
  }

  return false;
}

const clerkProAuth: AuthFn<Request> = withAuthChallenges(
  async (request) => {
    const bearer = extractBearerToken(request.headers.get("authorization"));
    const cookieToken = extractSessionCookie(request.headers.get("cookie"));
    const token = bearer ?? cookieToken;

    if (!token) {
      return null;
    }

    let claims: Record<string, unknown>;
    try {
      const verified = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
        jwtKey: process.env.CLERK_JWT_KEY,
      });
      claims = verified as unknown as Record<string, unknown>;
    } catch {
      // Fall through so vercelOidc() or localDev() can evaluate non-Clerk bearer tokens.
      return null;
    }

    const sub = typeof claims.sub === "string" ? claims.sub : null;
    if (!sub) {
      return null;
    }

    const isAdmin = hasAdminClaim(claims);
    const isPro = !PRO_ENABLED || isAdmin || hasProClaim(claims);

    if (!isPro) {
      throw new ForbiddenError({
        message: "The Interflect tutor requires a Pro subscription.",
      });
    }

    return {
      authenticator: "clerk",
      principalId: sub,
      principalType: "user",
      attributes: {
        clerkToken: token,
        isAdmin: String(isAdmin),
        isPro: "true",
      },
    };
  },
  [{ scheme: "Bearer" }],
);

export default eveChannel({
  auth: [clerkProAuth, vercelOidc(), localDev()],
});
