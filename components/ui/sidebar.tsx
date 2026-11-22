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

export function SidebarProvider({
  children,
  side = "left",
}: {
  children: ReactNode;
  side?: "left" | "right";
}) {
  const [openMobile, setOpenMobile] = useState(false);
  const toggleMobile = useCallback(() => setOpenMobile((prev) => !prev), []);

  const value = useMemo(
    () => ({ openMobile, setOpenMobile, toggleMobile, side }),
    [openMobile, toggleMobile, side],
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

/** Mobile slide-over built on the UI SDK Drawer. Pass `className="night"` to render it on the night palette. */
export function SidebarMobileDrawer({
  title,
  description,
  triggerLabel = "Open menu",
  triggerClassName = "btn btn-secondary btn-sm",
  triggerContent,
  className = "",
  children,
}: {
  title: string;
  description?: string;
  triggerLabel?: string;
  triggerClassName?: string;
  triggerContent?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const { openMobile, setOpenMobile, side } = useSidebar();

  return (
    <Drawer side={side} open={openMobile} onOpenChange={setOpenMobile} preventEdgeSwipe>
      <DrawerTrigger aria-label={triggerLabel} className={triggerClassName}>
        {triggerContent ?? (
          <>
            <PanelLeft className="h-4 w-4" aria-hidden="true" />
            <span>{triggerLabel}</span>
          </>
        )}
      </DrawerTrigger>

      <DrawerBackdrop className="bg-night/60 transition-opacity duration-200 data-starting-style:opacity-0 data-ending-style:opacity-0" />

      <DrawerContent
        initialFocus="content"
        className={`flex h-dvh w-[min(20rem,86vw)] flex-col border-line bg-bg text-ink outline-none transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] data-ending-style:duration-200 motion-reduce:transition-none ${
          side === "left"
            ? "border-r data-starting-style:-translate-x-full data-ending-style:-translate-x-full"
            : "border-l data-starting-style:translate-x-full data-ending-style:translate-x-full"
        } ${className}`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div className="min-w-0">
            <DrawerTitle className="truncate text-sm font-bold">{title}</DrawerTitle>
            {description && (
              <DrawerDescription className="truncate text-xs text-mist">
                {description}
              </DrawerDescription>
            )}
          </div>
          <DrawerClose aria-label={`Close ${title}`} className="btn btn-ghost btn-icon">
            <X className="h-4 w-4" aria-hidden="true" />
          </DrawerClose>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
      </DrawerContent>
    </Drawer>
  );
}
