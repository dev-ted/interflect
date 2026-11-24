"use client";

import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import {
  BookOpen,
  LayoutDashboard,
  LogIn,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui-sdk/react/tooltip";
import { usePreference } from "@ui-sdk/react/preferences";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/brand/ThemeToggle";
import { CookieSettingsButton } from "@/components/consent/CookieConsent";
import { SidebarMobileDrawer, SidebarProvider } from "@/components/ui/sidebar";
import { sidebarState } from "@/lib/color-scheme";
import { isAdminRole, PRO_PLAN_SLUG } from "@/lib/auth";
import { PRO_ENABLED } from "@/convex/lib/features";

type Has = (p: { plan: string } | { feature: string }) => boolean;
const isPro = (has: Has) =>
  has({ plan: PRO_PLAN_SLUG }) || has({ feature: "pro_courses" });

const tooltipClass =
  "z-50 rounded-md bg-ink px-2 py-1 text-xs font-medium text-bg origin-(--transform-origin) transition-[opacity,scale] duration-150 ease-(--ease-out) data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:opacity-0 motion-reduce:data-starting-style:scale-100";

/**
 * The sidebar contents. `rail` renders the desktop version, which can collapse to icons;
 * the mobile drawer always shows the full version.
 */
function SidebarBody({ rail = false }: { rail?: boolean }) {
  const pathname = usePathname() ?? "/";
  const { user } = useUser();
  const isAdmin = isAdminRole(user?.publicMetadata);
  const { value: state } = usePreference(sidebarState);
  const collapsed = rail && state === "collapsed";

  const items = [
    { href: "/dashboard", label: "My learning", Icon: LayoutDashboard, auth: true },
    { href: "/courses", label: "Courses", Icon: BookOpen },
    ...(isAdmin ? [{ href: "/admin", label: "Admin studio", Icon: ShieldCheck }] : []),
  ];

  return (
    <div className="flex h-full flex-col gap-6 p-3">
      <div className="flex h-10 items-center justify-between gap-2 rail-collapsed:justify-center">
        <Link href="/" aria-label="Interflect home" className="rounded-md px-2 rail-collapsed:hidden">
          <Logo />
        </Link>
        {rail && (
          <Tooltip delay={300} disabled={!collapsed}>
            <TooltipTrigger
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
              onClick={() => sidebarState.set(collapsed ? "expanded" : "collapsed")}
              className="btn btn-ghost btn-icon btn-sm w-8 text-mist hover:text-ink"
            >
              {collapsed ? (
                <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
              ) : (
                <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
              )}
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8} className={tooltipClass}>
              Expand sidebar
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      <nav aria-label="App" className="flex flex-col gap-1">
        {items.map(({ href, label, Icon, auth }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          const link = (
            <Tooltip key={href} delay={300} disabled={!collapsed}>
              <TooltipTrigger
                render={
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`relative flex h-10 items-center gap-3 rounded-[10px] px-3 text-sm font-medium transition-colors duration-150 rail-collapsed:justify-center rail-collapsed:px-0 ${
                      active ? "bg-subtle text-ink" : "text-mist hover:bg-subtle/60 hover:text-ink"
                    }`}
                  />
                }
              >
                {active && (
                  <span className="absolute top-2 bottom-2 left-0 w-0.5 rounded-full bg-accent" aria-hidden="true" />
                )}
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate rail-collapsed:sr-only">{label}</span>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8} className={tooltipClass}>
                {label}
              </TooltipContent>
            </Tooltip>
          );
          return auth ? <Authenticated key={href}>{link}</Authenticated> : link;
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-4">
        {PRO_ENABLED && !isAdmin && (
          <Authenticated>
            <Show when={(has) => isPro(has)} fallback={<UpgradeCard />}>
              {null}
            </Show>
          </Authenticated>
        )}
        {PRO_ENABLED && (
          <Unauthenticated>
            <UpgradeCard />
          </Unauthenticated>
        )}

        <div className="flex flex-col gap-3 border-t border-line pt-4 rail-collapsed:items-center">
          <Authenticated>
            <div className="flex min-w-0 items-center gap-2.5 px-1 rail-collapsed:px-0">
              <UserButton />
              <span className="truncate text-sm font-medium rail-collapsed:hidden">
                {user?.firstName ?? "Account"}
              </span>
            </div>
          </Authenticated>
          <Unauthenticated>
            <div className="grid grid-cols-2 gap-2 rail-collapsed:hidden">
              <SignInButton mode="modal">
                <button type="button" className="btn btn-secondary btn-sm">Sign in</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button type="button" className="btn btn-primary btn-sm">Sign up</button>
              </SignUpButton>
            </div>
            <div className="hidden rail-collapsed:block">
              <SignInButton mode="modal">
                <button type="button" aria-label="Sign in" className="btn btn-secondary btn-icon btn-sm w-8">
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                </button>
              </SignInButton>
            </div>
          </Unauthenticated>
          <div className="flex items-center justify-between px-1 rail-collapsed:hidden">
            <span className="text-xs text-mist">Theme</span>
            <ThemeToggle />
          </div>
          <CookieSettingsButton className="px-1 text-xs text-mist rail-collapsed:hidden" />
          {rail && (
            <div className="hidden rail-collapsed:block">
              <ThemeToggle vertical />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UpgradeCard() {
  return (
    <div className="rounded-[14px] border border-line bg-surface p-4 rail-collapsed:hidden">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
        Interflect Pro
      </p>
      <p className="mt-1 text-xs leading-relaxed text-mist">
        Every course, every lesson, and the AI tutor.
      </p>
      <Link href="/pricing" className="btn btn-accent btn-sm mt-3 w-full">
        See Pro
      </Link>
    </div>
  );
}

/** App layout: a collapsible sidebar on desktop, a drawer on mobile. Both follow the theme. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <aside
        data-rail
        className="sticky top-0 hidden h-dvh w-[248px] shrink-0 border-r border-line bg-surface transition-[width] duration-200 ease-(--ease-out) motion-reduce:transition-none lg:block rail-collapsed:w-16"
      >
        {/* ponytail: animating width relayouts the page; fine for an occasional toggle. */}
        <Suspense fallback={null}>
          <SidebarBody rail />
        </Suspense>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-bg/85 px-4 backdrop-blur-md lg:hidden">
          <Link href="/" aria-label="Interflect home">
            <Logo />
          </Link>
          <SidebarProvider>
            <SidebarMobileDrawer
              title="Interflect"
              triggerLabel="Open navigation"
              triggerClassName="btn btn-ghost btn-icon"
              triggerContent={<Menu className="h-5 w-5" aria-hidden="true" />}
            >
              <Suspense fallback={null}>
                <SidebarBody />
              </Suspense>
            </SidebarMobileDrawer>
          </SidebarProvider>
        </header>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

