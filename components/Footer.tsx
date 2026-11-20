import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-zinc-500 sm:flex-row sm:px-6 lg:px-8 dark:text-zinc-400">
        <div className="flex items-center gap-2 font-medium text-zinc-900 dark:text-zinc-100">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-white">
            <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <span>Learnly Studio</span>
          <span className="text-zinc-400 dark:text-zinc-600">·</span>
          <span className="font-normal text-zinc-500 dark:text-zinc-400">
            By Sonny Sangha
          </span>
        </div>

        <nav aria-label="Footer" className="flex items-center gap-6">
          <Link
            href="/courses"
            className="transition-colors hover:text-zinc-950 dark:hover:text-zinc-100"
          >
            Courses
          </Link>
          <Link
            href="/pricing"
            className="transition-colors hover:text-zinc-950 dark:hover:text-zinc-100"
          >
            Pricing
          </Link>
          <Link
            href="/dashboard"
            className="transition-colors hover:text-zinc-950 dark:hover:text-zinc-100"
          >
            My Learning
          </Link>
          <Link
            href="/admin"
            className="transition-colors hover:text-zinc-950 dark:hover:text-zinc-100"
          >
            Admin Studio
          </Link>
        </nav>
      </div>
    </footer>
  );
}
