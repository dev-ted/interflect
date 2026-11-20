import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t-2 border-[#18181B] bg-[#F6EFE0] dark:border-[#323244] dark:bg-[#12121A]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-[#52525B] sm:flex-row sm:px-6 lg:px-8 dark:text-[#B4B4C6]">
        <div className="flex flex-wrap items-center justify-center gap-2.5 font-bold text-[#111116] dark:text-[#FAFAF5]">
          <span className="flex h-7 w-7 -rotate-3 items-center justify-center rounded-lg border-2 border-[#18181B] bg-[#FF5A36] text-[#111116] shadow-[2px_2px_0_0_#111116] dark:border-[#111116]">
            <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <span className="font-display font-extrabold tracking-tight">
            Learnly Studio
          </span>
          <span className="rounded-full border border-[#18181B]/30 bg-white px-2.5 py-0.5 text-xs font-semibold text-[#52525B] dark:border-[#3A3A52] dark:bg-[#16161F] dark:text-[#B4B4C6]">
            Crafted by Teddy
          </span>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-6 font-semibold">
          <Link
            href="/courses"
            className="transition-colors hover:text-[#111116] hover:underline decoration-2 underline-offset-4 decoration-[#FF5A36] dark:hover:text-[#FAFAF5]"
          >
            Courses
          </Link>
          <Link
            href="/pricing"
            className="transition-colors hover:text-[#111116] hover:underline decoration-2 underline-offset-4 decoration-[#2563EB] dark:hover:text-[#FAFAF5]"
          >
            Pricing
          </Link>
          <Link
            href="/dashboard"
            className="transition-colors hover:text-[#111116] hover:underline decoration-2 underline-offset-4 decoration-[#00B87C] dark:hover:text-[#FAFAF5]"
          >
            My Learning
          </Link>
          <Link
            href="/admin"
            className="transition-colors hover:text-[#111116] hover:underline decoration-2 underline-offset-4 decoration-[#FFB800] dark:hover:text-[#FAFAF5]"
          >
            Admin Studio
          </Link>
        </nav>
      </div>
    </footer>
  );
}
