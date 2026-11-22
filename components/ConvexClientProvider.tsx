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
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastRegion,
  ToastTitle,
} from "@ui-sdk/react/toast";
import { CheckCircle2, Info, Loader2, TriangleAlert, X, XCircle } from "lucide-react";

// Status is shown by icon as well as colour, so it never relies on colour alone.
const TOAST_ICONS = {
  success: <CheckCircle2 className="h-4 w-4 shrink-0 text-sage" aria-hidden="true" />,
  error: <XCircle className="h-4 w-4 shrink-0 text-danger" aria-hidden="true" />,
  warning: <TriangleAlert className="h-4 w-4 shrink-0 text-sun" aria-hidden="true" />,
  loading: <Loader2 className="h-4 w-4 shrink-0 animate-spin text-mist motion-reduce:animate-none" aria-hidden="true" />,
} as const;
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
      has?.({ feature: "vukora_ai" }),
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

function AppToaster() {
  return (
    <ToastRegion
      side="top"
      align="center"
      expanded
      aria-label="Notifications"
      className="pointer-events-none top-4 m-0 w-[min(25rem,calc(100vw-2rem))] overflow-visible border-0 bg-transparent p-0 [&_[data-slot=toast-list]]:m-0 [&_[data-slot=toast-list]]:flex [&_[data-slot=toast-list]]:list-none [&_[data-slot=toast-list]]:flex-col [&_[data-slot=toast-list]]:gap-2 [&_[data-slot=toast-list]]:p-0"
    >
      {(item) => (
        <Toast className="card pointer-events-auto relative flex w-full items-center gap-3 overflow-hidden py-3 pr-2 pl-4 text-sm text-ink transition-[opacity,translate] duration-200 ease-(--ease-out) select-none before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-primary data-ending-style:-translate-y-2 data-ending-style:opacity-0 data-starting-style:-translate-y-2 data-starting-style:opacity-0 data-[type=error]:before:bg-danger data-[type=success]:before:bg-sage data-[type=warning]:before:bg-sun motion-reduce:data-ending-style:translate-y-0 motion-reduce:data-starting-style:translate-y-0">
          {TOAST_ICONS[item.type as keyof typeof TOAST_ICONS] ?? (
            <Info className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          )}
          <div className="min-w-0 flex-1">
            <ToastTitle className="font-semibold leading-snug" />
            {item.description && <ToastDescription className="mt-0.5 text-mist" />}
          </div>
          {item.action && <ToastAction className="btn btn-secondary btn-sm shrink-0" />}
          <ToastClose aria-label="Dismiss notification" className="btn btn-ghost btn-icon btn-sm w-8 shrink-0 text-mist">
            <X className="h-4 w-4" aria-hidden="true" />
          </ToastClose>
        </Toast>
      )}
    </ToastRegion>
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
          <AppToaster />
        </ConvexProviderWithAuth>
      </ConvexAuthNonceContext.Provider>
    </ConvexAuthRefreshContext.Provider>
  );
}
