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
    <header className="sticky top-0 z-40 border-b-2 border-[#18181B] bg-[#FFFBF2]/92 backdrop-blur-md dark:border-[#323244] dark:bg-[#0D0D12]/92">
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
                className="tactile-btn-sm inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl bg-white text-[#111116] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] dark:bg-[#16161F] dark:text-[#FAFAF5]"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </DrawerTrigger>

              <DrawerBackdrop className="bg-[#111116]/60 backdrop-blur-[2px]" />

              <DrawerContent
                initialFocus="content"
                className="flex h-dvh w-[min(20rem,86vw)] flex-col border-r-2 border-[#18181B] bg-[#FFFBF2] shadow-2xl outline-none dark:border-[#3A3A52] dark:bg-[#0D0D12]"
              >
                <div className="flex items-center justify-between border-b-2 border-[#18181B] bg-white px-4 py-4 dark:border-[#323244] dark:bg-[#16161F]">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 -rotate-3 items-center justify-center rounded-xl border-2 border-[#18181B] bg-[#FF5A36] text-[#111116] shadow-[2px_2px_0_0_#111116] dark:border-[#111116]">
                      <GraduationCap className="h-4.5 w-4.5" aria-hidden="true" />
                    </span>
                    <div>
                      <DrawerTitle className="font-display text-sm font-extrabold text-[#111116] dark:text-[#FAFAF5]">
                        Learnly Studio
                      </DrawerTitle>
                      <DrawerDescription className="text-xs text-[#52525B] dark:text-[#B4B4C6]">
                        Navigate courses &amp; learning
                      </DrawerDescription>
                    </div>
                  </div>
                  <DrawerClose
                    aria-label="Close navigation menu"
                    className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border-2 border-transparent text-[#52525B] transition-colors hover:border-[#18181B] hover:bg-[#F6EFE0] hover:text-[#111116] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] dark:text-[#B4B4C6] dark:hover:border-[#3A3A52] dark:hover:bg-[#1F1F2D] dark:hover:text-[#FAFAF5]"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </DrawerClose>
                </div>

                <nav
                  aria-label="Mobile primary navigation"
                  className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain p-3"
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
                        className={`flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold transition-colors ${
                          active
                            ? "border-2 border-[#18181B] bg-[#FFB800] text-[#111116] shadow-[2px_2px_0_0_#111116] dark:border-[#18181B]"
                            : "border-2 border-transparent text-[#111116] hover:bg-[#F6EFE0] dark:text-[#FAFAF5] dark:hover:bg-[#16161F]"
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
                      className={`flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold transition-colors ${
                        pathname?.startsWith("/admin")
                          ? "border-2 border-[#18181B] bg-[#2563EB] text-white shadow-[2px_2px_0_0_#111116]"
                          : "border-2 border-transparent text-[#1D4ED8] hover:bg-[#EFF6FF] dark:text-[#60A5FA] dark:hover:bg-[#16161F]"
                      }`}
                    >
                      <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                      Admin Studio
                    </Link>
                  )}
                </nav>

                <div className="border-t-2 border-[#18181B] bg-white p-4 dark:border-[#323244] dark:bg-[#16161F]">
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
                          className="tactile-btn flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#1D4ED8]"
                        >
                          <Crown className="h-4 w-4" aria-hidden="true" />
                          Upgrade to Pro
                        </Link>
                      }
                    >
                      <div className="flex items-center justify-center gap-2 rounded-xl border-2 border-[#18181B] bg-[#FFB800] px-3 py-2.5 text-xs font-extrabold text-[#111116] shadow-[2px_2px_0_0_#111116]">
                        <Crown className="h-3.5 w-3.5" aria-hidden="true" />
                        Pro Membership Active
                      </div>
                    </Show>
                  </Authenticated>

                  <Unauthenticated>
                    <div className="flex flex-col gap-2.5">
                      <SignInButton mode="modal">
                        <button
                          type="button"
                          onClick={() => setMobileMenuOpen(false)}
                          className="tactile-btn-sm min-h-11 w-full cursor-pointer rounded-xl bg-[#FFFBF2] px-4 py-2.5 text-sm font-bold text-[#111116] dark:bg-[#1F1F2D] dark:text-[#FAFAF5]"
                        >
                          Sign In
                        </button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <button
                          type="button"
                          onClick={() => setMobileMenuOpen(false)}
                          className="tactile-btn min-h-11 w-full cursor-pointer rounded-xl bg-[#FF5A36] px-4 py-2.5 text-sm font-extrabold text-[#111116] hover:bg-[#FF6E4E]"
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
            className="group flex items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2563EB]"
          >
            <span className="flex h-9 w-9 -rotate-3 items-center justify-center rounded-xl border-2 border-[#18181B] bg-[#FF5A36] text-[#111116] shadow-[2px_2px_0_0_#111116] transition-transform duration-200 group-hover:rotate-3 motion-reduce:transition-none dark:border-[#111116] dark:shadow-[2px_2px_0_0_#000000]">
              <GraduationCap className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight text-[#111116] dark:text-[#FAFAF5]">
              Learnly{" "}
              <span className="inline-block rounded-md border border-[#18181B] bg-[#FFB800] px-1.5 py-0.5 text-xs font-extrabold text-[#111116] align-middle">
                STUDIO
              </span>
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-1.5 md:flex">
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
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-sm font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] ${
                    active
                      ? "border-2 border-[#18181B] bg-[#FFB800] text-[#111116] shadow-[2px_2px_0_0_#111116] dark:border-[#18181B]"
                      : "border-2 border-transparent text-[#52525B] hover:border-[#18181B]/20 hover:bg-[#F6EFE0] hover:text-[#111116] dark:text-[#B4B4C6] dark:hover:border-[#3A3A52] dark:hover:bg-[#16161F] dark:hover:text-[#FAFAF5]"
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
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-sm font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] ${
                  pathname?.startsWith("/admin")
                    ? "border-2 border-[#18181B] bg-[#2563EB] text-white shadow-[2px_2px_0_0_#111116]"
                    : "border-2 border-transparent text-[#1D4ED8] hover:border-[#2563EB]/30 hover:bg-[#EFF6FF] dark:text-[#60A5FA] dark:hover:bg-[#16161F]"
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
            <span className="hidden -rotate-2 items-center gap-1 rounded-full border-2 border-[#18181B] bg-[#FFB800] px-2.5 py-0.5 text-xs font-extrabold text-[#111116] shadow-[2px_2px_0_0_#111116] sm:inline-flex">
              <Crown className="h-3 w-3" aria-hidden="true" />
              PRO
            </span>
          </Show>

          <Unauthenticated>
            <SignInButton mode="modal">
              <button
                type="button"
                className="cursor-pointer rounded-xl px-3 py-1.5 text-sm font-bold text-[#111116] transition-colors hover:bg-[#F6EFE0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] dark:text-[#FAFAF5] dark:hover:bg-[#16161F]"
              >
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button
                type="button"
                className="tactile-btn-sm cursor-pointer rounded-xl bg-[#FF5A36] px-4 py-1.5 text-sm font-extrabold text-[#111116] hover:bg-[#FF6E4E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
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
                  className="tactile-btn-sm hidden items-center gap-1.5 rounded-xl bg-[#2563EB] px-3.5 py-1.5 text-xs font-extrabold text-white hover:bg-[#1D4ED8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] sm:inline-flex"
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
