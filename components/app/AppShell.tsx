"use client";

import type { ReactNode } from "react";
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
import { BookOpen, LayoutDashboard, Menu, ShieldCheck, Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/brand/ThemeToggle";
import { SidebarMobileDrawer, SidebarProvider } from "@/components/ui/sidebar";
import { isAdminRole, PRO_PLAN_SLUG } from "@/lib/auth";

type Has = (p: { plan: string } | { feature: string }) => boolean;
const isPro = (has: Has) =>
  has({ plan: PRO_PLAN_SLUG }) || has({ feature: "pro_courses" });

function SidebarBody() {
  const pathname = usePathname() ?? "/";
  const { user } = useUser();
  const isAdmin = isAdminRole(user?.publicMetadata);

  const items = [
    { href: "/dashboard", label: "My learning", Icon: LayoutDashboard, auth: true },
    { href: "/courses", label: "Courses", Icon: BookOpen },
    ...(isAdmin ? [{ href: "/admin", label: "Admin studio", Icon: ShieldCheck }] : []),
  ];

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <Link href="/" aria-label="Vukora home" className="w-fit rounded-md px-2 pt-1">
        <Logo />
      </Link>

      <nav aria-label="App" className="flex flex-col gap-0.5">
        {items.map(({ href, label, Icon, auth }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          const link = (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors duration-150 ${
                active ? "bg-subtle text-ink" : "text-mist hover:bg-subtle/60 hover:text-ink"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </Link>
          );
          return auth ? <Authenticated key={href}>{link}</Authenticated> : link;
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-4">
        <Authenticated>
          <Show when={(has) => isPro(has)} fallback={<UpgradeCard />}>
            {null}
          </Show>
        </Authenticated>
        <Unauthenticated>
          <UpgradeCard />
        </Unauthenticated>

        <div className="flex flex-col gap-3 border-t border-line pt-4">
          <Authenticated>
            <div className="flex min-w-0 items-center gap-2.5">
              <UserButton />
              <span className="truncate text-sm font-medium">
                {user?.firstName ?? "Account"}
              </span>
            </div>
          </Authenticated>
          <Unauthenticated>
            <div className="grid grid-cols-2 gap-2">
              <SignInButton mode="modal">
                <button type="button" className="btn btn-secondary btn-sm">Sign in</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button type="button" className="btn btn-primary btn-sm">Sign up</button>
              </SignUpButton>
            </div>
          </Unauthenticated>
          <div className="flex items-center justify-between">
            <span className="text-xs text-mist">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}

function UpgradeCard() {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <Sparkles className="h-4 w-4 text-sun" aria-hidden="true" />
        Vukora Pro
      </p>
      <p className="mt-1 text-xs leading-relaxed text-mist">
        Every course, every lesson, and the AI tutor.
      </p>
      <Link href="/pricing" className="btn btn-sun btn-sm mt-3 w-full">
        See Pro
      </Link>
    </div>
  );
}

/** Signed-in style layout: a night sidebar on desktop, a drawer on mobile. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <aside className="night sticky top-0 hidden h-dvh w-64 shrink-0 border-r border-line lg:block">
        <SidebarBody />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-bg/85 px-4 backdrop-blur-md lg:hidden">
          <Link href="/" aria-label="Vukora home">
            <Logo />
          </Link>
          <SidebarProvider>
            <SidebarMobileDrawer
              title="Vukora"
              className="night"
              triggerLabel="Open navigation"
              triggerClassName="btn btn-ghost btn-icon"
              triggerContent={<Menu className="h-5 w-5" aria-hidden="true" />}
            >
              <SidebarBody />
            </SidebarMobileDrawer>
          </SidebarProvider>
        </header>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
