import type { Metadata } from "next";
import { CourseCatalogClient } from "@/components/landing/CourseCatalogClient";

export const metadata: Metadata = {
  title: "Courses | Vukora Studio",
  description:
    "Explore Free and Pro full-stack & AI engineering courses with Mux video lessons, rich markdown guides, and interactive quizzes.",
};

export default function CoursesPage() {
  return (
    <main className="flex-1">
      <CourseCatalogClient />
    </main>
  );
}
