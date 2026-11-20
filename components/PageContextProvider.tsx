"use client";

import {
  Suspense,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import type { PageLearningContext } from "@/lib/types";

interface PageContextValue {
  context: PageLearningContext;
  setPageDetail: (detail: Partial<PageLearningContext>) => void;
  resetPageDetail: () => void;
}

const PageContext = createContext<PageContextValue | null>(null);

function deriveDefaultContext(pathname: string): PageLearningContext {
  if (pathname === "/") {
    return { pathname, pageTitle: "Home", pageType: "home" };
  }
  if (pathname === "/courses") {
    return { pathname, pageTitle: "Course Catalog", pageType: "courses" };
  }
  if (pathname === "/pricing") {
    return { pathname, pageTitle: "Pricing", pageType: "pricing" };
  }
  if (pathname === "/dashboard") {
    return {
      pathname,
      pageTitle: "My Learning Dashboard",
      pageType: "dashboard",
    };
  }
  if (pathname.startsWith("/admin")) {
    return { pathname, pageTitle: "Admin Studio", pageType: "admin" };
  }
  if (pathname.includes("/lessons/")) {
    return { pathname, pageTitle: "Lesson Viewer", pageType: "lesson" };
  }
  if (pathname.startsWith("/courses/")) {
    return { pathname, pageTitle: "Course Overview", pageType: "course" };
  }
  return { pathname, pageTitle: "LMS Platform", pageType: "other" };
}

function PathnameObserver({
  onChange,
}: {
  onChange: (pathname: string) => void;
}) {
  const pathname = usePathname() || "/";
  useEffect(() => {
    onChange(pathname);
  }, [pathname, onChange]);
  return null;
}

export function PageContextProvider({ children }: { children: ReactNode }) {
  const [pathname, setPathname] = useState("/");
  const [detail, setDetail] = useState<{
    pathname: string;
    data: Partial<PageLearningContext>;
  } | null>(null);

  const setPageDetail = useCallback(
    (next: Partial<PageLearningContext>) => {
      setDetail({ pathname, data: next });
    },
    [pathname],
  );

  const resetPageDetail = useCallback(() => {
    setDetail(null);
  }, []);

  const context = useMemo<PageLearningContext>(() => {
    const base = deriveDefaultContext(pathname);
    if (detail && detail.pathname === pathname) {
      return { ...base, ...detail.data, pathname };
    }
    return base;
  }, [pathname, detail]);

  const value = useMemo(
    () => ({ context, setPageDetail, resetPageDetail }),
    [context, setPageDetail, resetPageDetail],
  );

  return (
    <PageContext.Provider value={value}>
      <Suspense fallback={null}>
        <PathnameObserver onChange={setPathname} />
      </Suspense>
      {children}
    </PageContext.Provider>
  );
}

export function usePageContext(): PageContextValue {
  const ctx = useContext(PageContext);
  if (!ctx) {
    throw new Error("usePageContext must be used inside PageContextProvider");
  }
  return ctx;
}
