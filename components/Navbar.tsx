"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import {
  Authenticated,
  Unauthenticated,
  useConvexAuth,
} from "convex/react";
import {
  Drawer,
  DrawerBackdrop,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@ui-sdk/react/drawer";
import {
  BookOpen,
  Crown,
  GraduationCap,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";
import { isAdminRole, PRO_PLAN_SLUG } from "@/lib/auth";

const NAV_LINKS = [
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/pricing", label: "Pricing", icon: Crown },
  {
    href: "/dashboard",
    label: "My Learning",
    icon: LayoutDashboard,
    authOnly: true,
  },
];

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated } = useConvexAuth();
  const { user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = isAdminRole(user?.publicMetadata);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/85 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 md:gap-7">
          {/* Mobile Navigation Drawer powered by @ui-sdk/react/drawer */}
          <div className="md:hidden">
            <Drawer
              side="left"
              open={mobileMenuOpen}
              onOpenChange={setMobileMenuOpen}
              preventEdgeSwipe
            >
              <DrawerTrigger
                aria-label="Open navigation menu"
                className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </DrawerTrigger>

              <DrawerBackdrop className="bg-zinc-950/50 backdrop-blur-[2px]" />

              <DrawerContent
                initialFocus="content"
                className="flex h-dvh w-[min(20rem,86vw)] flex-col bg-white shadow-2xl outline-none dark:bg-zinc-950"
              >
                <div className="flex items-center justify-between border-b border-zinc-200/80 px-4 py-4 dark:border-zinc-800">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                      <GraduationCap className="h-4.5 w-4.5" aria-hidden="true" />
                    </span>
                    <div>
                      <DrawerTitle className="text-sm font-semibold text-zinc-950 dark:text-white">
                        Learnly Studio
                      </DrawerTitle>
                      <DrawerDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                        Navigate courses & learning
                      </DrawerDescription>
                    </div>
                  </div>
                  <DrawerClose
                    aria-label="Close navigation menu"
                    className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </DrawerClose>
                </div>

                <nav
                  aria-label="Mobile primary navigation"
                  className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain p-3"
                >
                  {NAV_LINKS.map((item) => {
                    if (item.authOnly && !isAuthenticated) return null;
                    const active =
                      pathname === item.href ||
                      (item.href !== "/" && pathname?.startsWith(item.href));
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={`flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                          active
                            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300"
                            : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                        {item.label}
                      </Link>
                    );
                  })}

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      aria-current={
                        pathname?.startsWith("/admin") ? "page" : undefined
                      }
                      className={`flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                        pathname?.startsWith("/admin")
                          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300"
                          : "text-indigo-600 hover:bg-indigo-50/70 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
                      }`}
                    >
                      <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                      Admin Studio
                    </Link>
                  )}
                </nav>

                <div className="border-t border-zinc-200/80 p-4 dark:border-zinc-800">
                  <Authenticated>
                    <Show
                      when={(checkHas) =>
                        checkHas({ plan: PRO_PLAN_SLUG }) ||
                        checkHas({ feature: "pro_courses" })
                      }
                      fallback={
                        <Link
                          href="/pricing"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
                        >
                          <Crown className="h-4 w-4" aria-hidden="true" />
                          Upgrade to Pro
                        </Link>
                      }
                    >
                      <div className="flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-xs font-semibold text-indigo-700 dark:border-indigo-800/70 dark:bg-indigo-950/70 dark:text-indigo-300">
                        <Crown className="h-3.5 w-3.5" aria-hidden="true" />
                        Pro Membership Active
                      </div>
                    </Show>
                  </Authenticated>

                  <Unauthenticated>
                    <div className="flex flex-col gap-2">
                      <SignInButton mode="modal">
                        <button
                          type="button"
                          onClick={() => setMobileMenuOpen(false)}
                          className="min-h-11 w-full cursor-pointer rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                        >
                          Sign In
                        </button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <button
                          type="button"
                          onClick={() => setMobileMenuOpen(false)}
                          className="min-h-11 w-full cursor-pointer rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white"
                        >
                          Get Started Free
                        </button>
                      </SignUpButton>
                    </div>
                  </Unauthenticated>
                </div>
              </DrawerContent>
            </Drawer>
          </div>

          <Link
            href="/"
            className="flex items-center gap-2.5 text-base font-semibold tracking-tight text-zinc-950 dark:text-zinc-50"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
              <GraduationCap className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
            <span>Learnly Studio</span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((item) => {
              if (item.authOnly && !isAuthenticated) return null;
              const active =
                pathname === item.href ||
                (item.href !== "/" && pathname?.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-zinc-100 text-zinc-950 dark:bg-zinc-800 dark:text-white"
                      : "text-zinc-600 hover:bg-zinc-100/70 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800/70 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                href="/admin"
                aria-current={pathname?.startsWith("/admin") ? "page" : undefined}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  pathname?.startsWith("/admin")
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                    : "text-indigo-600 hover:bg-indigo-50/70 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Admin
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Show
            when={(checkHas) =>
              checkHas({ plan: PRO_PLAN_SLUG }) ||
              checkHas({ feature: "pro_courses" })
            }
          >
            <span className="hidden items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 sm:inline-flex dark:border-indigo-800/70 dark:bg-indigo-950/70 dark:text-indigo-300">
              <Crown className="h-3 w-3" aria-hidden="true" />
              Pro
            </span>
          </Show>

          <Unauthenticated>
            <SignInButton mode="modal">
              <button
                type="button"
                className="cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
              >
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button
                type="button"
                className="cursor-pointer rounded-lg bg-zinc-950 px-3.5 py-1.5 text-sm font-medium text-white shadow-xs transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                Get Started
              </button>
            </SignUpButton>
          </Unauthenticated>

          <Authenticated>
            <Show
              when={(checkHas) =>
                checkHas({ plan: PRO_PLAN_SLUG }) ||
                checkHas({ feature: "pro_courses" })
              }
              fallback={
                <Link
                  href="/pricing"
                  className="hidden items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 sm:inline-flex"
                >
                  <Crown className="h-3.5 w-3.5" aria-hidden="true" />
                  Upgrade to Pro
                </Link>
              }
            >
              {null}
            </Show>
            <UserButton />
          </Authenticated>
        </div>
      </div>
    </header>
  );
}
