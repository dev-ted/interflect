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

function AppToaster() {
  return (
    <ToastRegion
      side="top"
      align="center"
      expanded
      aria-label="Notifications"
      className="pointer-events-none top-4 m-0 w-[min(24rem,calc(100vw-2rem))] overflow-visible border-0 bg-transparent p-0 [&_[data-slot=toast-list]]:m-0 [&_[data-slot=toast-list]]:flex [&_[data-slot=toast-list]]:list-none [&_[data-slot=toast-list]]:flex-col [&_[data-slot=toast-list]]:gap-2 [&_[data-slot=toast-list]]:p-0"
    >
      {(item) => {
        const type = item.type;
        const borderAccent =
          type === "success"
            ? "border-emerald-300/90 dark:border-emerald-800/80"
            : type === "error"
              ? "border-rose-300/90 dark:border-rose-800/80"
              : type === "warning"
                ? "border-amber-300/90 dark:border-amber-800/80"
                : "border-zinc-200/90 dark:border-zinc-700/80";

        return (
          <Toast
            className={`pointer-events-auto flex w-full select-none items-center gap-3 rounded-2xl border bg-white px-4 py-3 text-sm text-zinc-950 shadow-xl shadow-zinc-950/15 transition-[opacity,transform] duration-200 data-starting-style:-translate-y-2 data-starting-style:opacity-0 data-ending-style:-translate-y-2 data-ending-style:opacity-0 dark:bg-zinc-900 dark:text-zinc-50 dark:shadow-black/50 ${borderAccent}`}
          >
            {type === "success" ? (
              <CheckCircle2
                className="h-4.5 w-4.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                aria-hidden="true"
              />
            ) : type === "error" ? (
              <XCircle
                className="h-4.5 w-4.5 shrink-0 text-rose-600 dark:text-rose-400"
                aria-hidden="true"
              />
            ) : type === "warning" ? (
              <TriangleAlert
                className="h-4.5 w-4.5 shrink-0 text-amber-600 dark:text-amber-400"
                aria-hidden="true"
              />
            ) : type === "loading" ? (
              <Loader2
                className="h-4.5 w-4.5 shrink-0 animate-spin text-indigo-600 dark:text-indigo-400"
                aria-hidden="true"
              />
            ) : (
              <Info
                className="h-4.5 w-4.5 shrink-0 text-indigo-600 dark:text-indigo-400"
                aria-hidden="true"
              />
            )}

            <div className="min-w-0 flex-1">
              <ToastTitle className="font-semibold leading-snug text-zinc-950 dark:text-zinc-50" />
              {item.description && (
                <ToastDescription className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400" />
              )}
            </div>

            {item.action && (
              <ToastAction className="shrink-0 cursor-pointer rounded-lg bg-zinc-950 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200" />
            )}

            <ToastClose
              aria-label="Dismiss notification"
              className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
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
