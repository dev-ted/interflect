"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
  useUser,
} from "@clerk/nextjs";
import {
  BookOpen,
  Crown,
  GraduationCap,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";
import { isAdminRole, PRO_PLAN_SLUG } from "@/lib/auth";

const NAV_LINKS = [
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/pricing", label: "Pricing", icon: Crown },
  { href: "/dashboard", label: "My Learning", icon: LayoutDashboard, authOnly: true },
];

export function Navbar() {
  const pathname = usePathname();
  const { has, isSignedIn } = useAuth();
  const { user } = useUser();

  const isAdmin = isAdminRole(user?.publicMetadata);
  const isPro = Boolean(
    has?.({ plan: PRO_PLAN_SLUG }) || has?.({ feature: "pro_courses" }),
  );

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/85 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-7">
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
              if (item.authOnly && !isSignedIn) return null;
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
          {isSignedIn && isPro && (
            <span className="hidden items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 sm:inline-flex dark:border-indigo-800/70 dark:bg-indigo-950/70 dark:text-indigo-300">
              <Crown className="h-3 w-3" aria-hidden="true" />
              Pro
            </span>
          )}

          <Show when="signed-out">
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
          </Show>

          <Show when="signed-in">
            {!isPro && (
              <Link
                href="/pricing"
                className="hidden items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 sm:inline-flex"
              >
                <Crown className="h-3.5 w-3.5" aria-hidden="true" />
                Upgrade to Pro
              </Link>
            )}
            <UserButton />
          </Show>
        </div>
      </div>
    </header>
  );
}
