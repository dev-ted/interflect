"use client";

import { useMutation, useQuery } from "convex/react";
import { toast } from "@ui-sdk/react/toast";
import { BookmarkCheck, BookmarkPlus } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

/** Toggle whether a course is pinned to the dashboard's tracked list. */
export function TrackButton({
  courseId,
  className = "btn btn-secondary",
}: {
  courseId: Id<"courses">;
  className?: string;
}) {
  const tracked = useQuery(api.insights.isTracked, { courseId });
  const track = useMutation(api.insights.trackCourse);
  const untrack = useMutation(api.insights.untrackCourse);
  const isOn = tracked !== null && tracked !== undefined;

  const toggle = async () => {
    try {
      if (isOn) {
        await untrack({ courseId });
        toast.success("Stopped tracking this course.");
      } else {
        await track({ courseId });
        toast.success("Tracking this course. Set a target date from your dashboard.");
      }
    } catch {
      toast.error("Couldn’t update tracking. Try again.");
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={tracked === undefined}
      aria-pressed={isOn}
      className={className}
    >
      {isOn ? (
        <BookmarkCheck className="h-4 w-4 text-accent-ink" aria-hidden="true" />
      ) : (
        <BookmarkPlus className="h-4 w-4" aria-hidden="true" />
      )}
      {isOn ? "Tracking" : "Track course"}
    </button>
  );
}
