import type { Metadata } from "next";
import { CourseCatalogClient } from "@/components/landing/CourseCatalogClient";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Free and Pro full-stack and AI engineering courses with video lessons, written guides and quizzes.",
};

export default function CoursesPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10">
      <CourseCatalogClient />
    </main>
  );
}
