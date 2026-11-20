export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface PageLearningContext {
  pathname: string;
  pageTitle: string;
  pageType: "home" | "courses" | "course" | "lesson" | "pricing" | "dashboard" | "admin" | "other";
  courseSlug?: string;
  courseTitle?: string;
  courseTier?: "free" | "pro";
  moduleTitle?: string;
  lessonSlug?: string;
  lessonTitle?: string;
  lessonSummary?: string;
}

export interface InteractiveQuizPayload {
  title: string;
  topic: string;
  questions: QuizQuestion[];
}
