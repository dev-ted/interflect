"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import { Menu } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/brand/ThemeToggle";
import { SidebarMobileDrawer, SidebarProvider } from "@/components/ui/sidebar";

const LINKS = [
  { href: "/courses", label: "Courses" },
  { href: "/pricing", label: "Pricing" },
];

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-4 sm:px-6">
        <Link href="/" aria-label="Vukora home" className="rounded-md">
          <Logo />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 text-sm font-medium text-mist md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors duration-150 hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle className="hidden sm:inline-flex" />
          <Unauthenticated>
            <SignInButton mode="modal">
              <button type="button" className="btn btn-ghost hidden sm:inline-flex">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button type="button" className="btn btn-primary">
                Start learning
              </button>
            </SignUpButton>
          </Unauthenticated>
          <Authenticated>
            <Link href="/dashboard" className="btn btn-primary">
              My learning
            </Link>
            <UserButton />
          </Authenticated>

          <div className="md:hidden">
            <SidebarProvider side="right">
              <SidebarMobileDrawer
                title="Menu"
                triggerLabel="Open menu"
                triggerClassName="btn btn-ghost btn-icon"
                triggerContent={<Menu className="h-5 w-5" aria-hidden="true" />}
              >
                <nav aria-label="Mobile" className="flex flex-col gap-1 p-3">
                  {LINKS.map((l) => (
                    <Link key={l.href} href={l.href} className="rounded-md px-3 py-2.5 font-medium hover:bg-subtle">
                      {l.label}
                    </Link>
                  ))}
                </nav>
                <div className="flex items-center justify-between border-t border-line p-4">
                  <span className="text-sm text-mist">Theme</span>
                  <ThemeToggle />
                </div>
              </SidebarMobileDrawer>
            </SidebarProvider>
          </div>
        </div>
      </div>
    </header>
  );
}
