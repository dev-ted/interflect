import type { Metadata } from "next";
import { CourseCatalogClient } from "@/components/landing/CourseCatalogClient";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Courses in UI design, UX, accessibility, design systems and frontend craft, with video lessons, notes and quizzes.",
};

export default function CoursesPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10">
      <CourseCatalogClient />
    </main>
  );
}
