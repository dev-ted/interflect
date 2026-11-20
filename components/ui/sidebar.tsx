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
          "tactile-btn-sm inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-sm font-bold text-[#111116] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] dark:bg-[#16161F] dark:text-[#FAFAF5]"
        }
      >
        {triggerContent ?? (
          <>
            <PanelLeft className="h-4 w-4" aria-hidden="true" />
            <span>{triggerLabel}</span>
          </>
        )}
      </DrawerTrigger>

      <DrawerBackdrop className="bg-[#111116]/60 backdrop-blur-[2px]" />

      <DrawerContent
        initialFocus="content"
        className="flex h-dvh w-[min(22rem,88vw)] flex-col border-r-2 border-[#18181B] bg-[#FFFBF2] shadow-2xl outline-none dark:border-[#3A3A52] dark:bg-[#0D0D12]"
      >
        <div className="flex items-center justify-between gap-3 border-b-2 border-[#18181B] bg-white px-4 py-3.5 dark:border-[#323244] dark:bg-[#16161F]">
          <div className="min-w-0">
            <DrawerTitle className="font-display truncate text-sm font-extrabold text-[#111116] dark:text-[#FAFAF5]">
              {title}
            </DrawerTitle>
            {description && (
              <DrawerDescription className="truncate text-xs text-[#52525B] dark:text-[#B4B4C6]">
                {description}
              </DrawerDescription>
            )}
          </div>
          <DrawerClose
            aria-label={`Close ${title}`}
            className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border-2 border-transparent text-[#52525B] transition-colors hover:border-[#18181B] hover:bg-[#F6EFE0] hover:text-[#111116] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] dark:text-[#B4B4C6] dark:hover:border-[#3A3A52] dark:hover:bg-[#1F1F2D] dark:hover:text-[#FAFAF5]"
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
