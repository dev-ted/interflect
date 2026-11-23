/** Compact label for a course or lesson length, from a measured total in seconds. */
export function formatLearningTime(
  totalSeconds: number,
  style: "short" | "long" = "short",
): string {
  const minutes = Math.max(0, Math.round(totalSeconds / 60));
  if (minutes <= 0) return "";
  if (minutes < 60) {
    if (style === "long") {
      return minutes === 1 ? "1 minute" : `${minutes} minutes`;
    }
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  const hourLabel = hours === 1 ? "1 hour" : `${hours} hours`;
  if (remainder === 0) return hourLabel;
  if (style === "long") {
    const minuteLabel = remainder === 1 ? "1 minute" : `${remainder} minutes`;
    return `${hourLabel} ${minuteLabel}`;
  }
  return `${hours} h ${remainder} min`;
}

/** Lesson durations win. The stored hour count is only a fallback before any lesson exists. */
export function courseLengthSeconds(
  totalDurationSeconds: number,
  estimatedHours: number,
): number {
  if (totalDurationSeconds > 0) return totalDurationSeconds;
  if (estimatedHours > 0) return Math.round(estimatedHours * 3600);
  return 0;
}
