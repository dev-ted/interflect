"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  Drawer,
  DrawerBackdrop,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@ui-sdk/react/drawer";
import { PanelLeft, X } from "lucide-react";

interface SidebarContextValue {
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  toggleMobile: () => void;
  side: "left" | "right";
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return ctx;
}

/**
 * shadcn/ui-pattern Sidebar architecture backed by Vercel Labs UI SDK
 * (`@ui-sdk/react/drawer`) for the mobile slide-over sheet (native top-layer,
 * focus trap, Escape/swipe dismissal, and WAI-ARIA modal dialog semantics).
 */
export function SidebarProvider({
  children,
  side = "left",
}: {
  children: ReactNode;
  side?: "left" | "right";
}) {
  const [openMobile, setOpenMobile] = useState(false);
  const toggleMobile = useCallback(
    () => setOpenMobile((prev) => !prev),
    [],
  );

  const value = useMemo(
    () => ({ openMobile, setOpenMobile, toggleMobile, side }),
    [openMobile, toggleMobile, side],
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function SidebarMobileDrawer({
  title,
  description,
  triggerLabel = "Toggle Sidebar",
  triggerClassName = "",
  triggerContent,
  children,
}: {
  title: string;
  description?: string;
  triggerLabel?: string;
  triggerClassName?: string;
  triggerContent?: ReactNode;
  children: ReactNode;
}) {
  const { openMobile, setOpenMobile, side } = useSidebar();

  return (
    <Drawer
      side={side}
      open={openMobile}
      onOpenChange={setOpenMobile}
      preventEdgeSwipe
    >
      <DrawerTrigger
        aria-label={triggerLabel}
        className={
          triggerClassName ||
          "inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        }
      >
        {triggerContent ?? (
          <>
            <PanelLeft className="h-4 w-4" aria-hidden="true" />
            <span>{triggerLabel}</span>
          </>
        )}
      </DrawerTrigger>

      <DrawerBackdrop className="bg-zinc-950/50 backdrop-blur-[2px]" />

      <DrawerContent
        initialFocus="content"
        className="flex h-dvh w-[min(22rem,88vw)] flex-col bg-white shadow-2xl outline-none dark:bg-zinc-950"
      >
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200/80 px-4 py-3.5 dark:border-zinc-800">
          <div className="min-w-0">
            <DrawerTitle className="truncate text-sm font-semibold text-zinc-950 dark:text-white">
              {title}
            </DrawerTitle>
            {description && (
              <DrawerDescription className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                {description}
              </DrawerDescription>
            )}
          </div>
          <DrawerClose
            aria-label={`Close ${title}`}
            className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </DrawerClose>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-gutter:stable]">
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
