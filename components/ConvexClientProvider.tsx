"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import { OverlayHost } from "@ui-sdk/react/overlays";
import { isAdminRole, PRO_PLAN_SLUG } from "@/lib/auth";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL in your .env.local file");
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

const ConvexAuthRefreshContext = createContext<() => Promise<void>>(
  async () => {},
);
const ConvexAuthNonceContext = createContext<number>(0);

export function useRefreshConvexAuth() {
  return useContext(ConvexAuthRefreshContext);
}

/**
 * Bridges Clerk's live client session (including Billing plan/feature claims
 * and admin role changes) into Convex's WebSocket auth.
 *
 * Stock `ConvexProviderWithClerk` only re-triggers `setAuth()` when
 * `[orgId, orgRole, sessionId]` change, which leaves Convex holding a stale
 * pre-upgrade JWT after in-app Clerk Billing checkout until a full refresh.
 */
function useClerkAuthForConvex() {
  const refreshNonce = useContext(ConvexAuthNonceContext);
  const {
    isLoaded,
    isSignedIn,
    getToken,
    orgId,
    orgRole,
    sessionId,
    sessionClaims,
    has,
  } = useAuth();
  const { user } = useUser();

  const hasPro = Boolean(
    has?.({ plan: PRO_PLAN_SLUG }) ||
      has?.({ feature: "pro_courses" }) ||
      has?.({ feature: "learnly_ai" }),
  );
  const isAdmin = isAdminRole(user?.publicMetadata);
  const claimsRecord = sessionClaims as Record<string, unknown> | undefined;
  const plaClaim =
    typeof claimsRecord?.pla === "string" ? claimsRecord.pla : "";
  const feaClaim =
    typeof claimsRecord?.fea === "string" ? claimsRecord.fea : "";

  const signature = `${sessionId ?? ""}|${orgId ?? ""}|${orgRole ?? ""}|${hasPro}|${isAdmin}|${plaClaim}|${feaClaim}|${refreshNonce}`;
  const lastFetchedSignatureRef = useRef<string | null>(null);
  const aud = claimsRecord?.aud;

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      const signatureChanged =
        lastFetchedSignatureRef.current !== null &&
        lastFetchedSignatureRef.current !== signature;
      lastFetchedSignatureRef.current = signature;
      const skipCache = forceRefreshToken || signatureChanged;
      try {
        if (aud === "convex") {
          return await getToken({ skipCache });
        }
        return await getToken({ template: "convex", skipCache });
      } catch {
        return null;
      }
    },
    // Re-create `fetchAccessToken` whenever billing claims, admin role, or
    // manual refresh nonce changes so ConvexProviderWithAuth calls `setAuth()`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [signature, aud],
  );

  return useMemo(
    () => ({
      isLoading: !isLoaded,
      isAuthenticated: isSignedIn ?? false,
      fetchAccessToken,
    }),
    [isLoaded, isSignedIn, fetchAccessToken],
  );
}

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  const clerk = useClerk();
  const [refreshNonce, setRefreshNonce] = useState(0);

  const refreshConvexAuth = useCallback(async () => {
    try {
      await clerk.session?.reload();
    } catch {
      // Ignore reload errors if session is already transitioning
    }
    setRefreshNonce((n) => n + 1);
  }, [clerk]);

  return (
    <ConvexAuthRefreshContext.Provider value={refreshConvexAuth}>
      <ConvexAuthNonceContext.Provider value={refreshNonce}>
        <ConvexProviderWithAuth client={convex} useAuth={useClerkAuthForConvex}>
          {children}
          <OverlayHost />
        </ConvexProviderWithAuth>
      </ConvexAuthNonceContext.Provider>
    </ConvexAuthRefreshContext.Provider>
  );
}
