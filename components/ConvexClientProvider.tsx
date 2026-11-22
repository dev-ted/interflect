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
import {
  CheckCircle2,
  Info,
  Loader2,
  TriangleAlert,
  X,
  XCircle,
} from "lucide-react";
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
      className="pointer-events-none top-4 m-0 w-[min(25rem,calc(100vw-2rem))] overflow-visible border-0 bg-transparent p-0 [&_[data-slot=toast-list]]:m-0 [&_[data-slot=toast-list]]:flex [&_[data-slot=toast-list]]:list-none [&_[data-slot=toast-list]]:flex-col [&_[data-slot=toast-list]]:gap-2.5 [&_[data-slot=toast-list]]:p-0"
    >
      {(item) => {
        const type = item.type;
        const badgeAccent =
          type === "success"
            ? "bg-[#00B87C] text-[#111116]"
            : type === "error"
              ? "bg-[#FF5A36] text-[#111116]"
              : type === "warning"
                ? "bg-[#FFB800] text-[#111116]"
                : "bg-[#2563EB] text-white";

        const borderAccent =
          type === "success"
            ? "border-[#18181B] dark:border-[#00B87C]/70"
            : type === "error"
              ? "border-[#18181B] dark:border-[#FF5A36]/75"
              : type === "warning"
                ? "border-[#18181B] dark:border-[#FFB800]/75"
                : "border-[#18181B] dark:border-[#3A3A52]";

        return (
          <Toast
            className={`pointer-events-auto flex w-full select-none items-center gap-3 rounded-2xl border-2 bg-[#FFFBF2] px-3.5 py-3 text-sm text-[#111116] shadow-[4px_4px_0_0_#111116] transition-[opacity,transform] duration-200 data-starting-style:-translate-y-2 data-starting-style:opacity-0 data-ending-style:-translate-y-2 data-ending-style:opacity-0 motion-reduce:transition-none dark:bg-[#16161F] dark:text-[#FAFAF5] dark:shadow-[4px_4px_0_0_#000000] ${borderAccent}`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border-2 border-[#18181B] shadow-[2px_2px_0_0_#111116] dark:border-[#111116] dark:shadow-[2px_2px_0_0_#000000] ${badgeAccent}`}
            >
              {type === "success" ? (
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              ) : type === "error" ? (
                <XCircle className="h-4 w-4" aria-hidden="true" />
              ) : type === "warning" ? (
                <TriangleAlert className="h-4 w-4" aria-hidden="true" />
              ) : type === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Info className="h-4 w-4" aria-hidden="true" />
              )}
            </span>

            <div className="min-w-0 flex-1">
              <ToastTitle className="font-display font-extrabold leading-snug text-[#111116] dark:text-[#FAFAF5]" />
              {item.description && (
                <ToastDescription className="mt-0.5 text-xs font-medium text-[#52525B] dark:text-[#B4B4C6]" />
              )}
            </div>

            {item.action && (
              <ToastAction className="tactile-btn-sm shrink-0 cursor-pointer rounded-xl bg-[#FF5A36] px-3 py-1.5 text-xs font-extrabold text-[#111116] hover:bg-[#FF6E4E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]" />
            )}

            <ToastClose
              aria-label="Dismiss notification"
              className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-xl border-2 border-transparent text-[#52525B] transition-colors hover:border-[#18181B] hover:bg-[#F6EFE0] hover:text-[#111116] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] dark:text-[#B4B4C6] dark:hover:border-[#3A3A52] dark:hover:bg-[#1F1F2D] dark:hover:text-[#FAFAF5]"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </ToastClose>
          </Toast>
        );
      }}
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
