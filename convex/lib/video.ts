/**
 * Turns a pasted video link into something we can play. Shared by the Convex
 * mutations (to reject bad links) and the lesson player (to build the embed).
 */
export type ParsedVideo =
  | { kind: "youtube" | "vimeo" | "loom"; embedUrl: string }
  | { kind: "file"; src: string };

export const SUPPORTED_VIDEO_HINT =
  "Use a YouTube, Vimeo or Loom link, or a direct link to an .mp4, .webm or .mov file.";

export function parseVideoUrl(raw: string): ParsedVideo | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  const host = url.hostname.replace(/^www\.|^m\./, "");
  const path = url.pathname.split("/").filter(Boolean);
  const id = (s: string | null | undefined) => (s && /^[\w-]{6,}$/.test(s) ? s : null);

  if (host === "youtu.be" || host === "youtube.com" || host === "youtube-nocookie.com") {
    const yt =
      host === "youtu.be"
        ? id(path[0])
        : ["embed", "shorts", "live"].includes(path[0])
          ? id(path[1])
          : id(url.searchParams.get("v"));
    return yt ? { kind: "youtube", embedUrl: `https://www.youtube-nocookie.com/embed/${yt}?rel=0` } : null;
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const vid = path.find((p) => /^\d+$/.test(p));
    // Unlisted Vimeo links carry a privacy hash after the id.
    const hash = path[path.indexOf(vid ?? "") + 1];
    if (!vid) return null;
    const h = hash && /^[0-9a-f]{6,}$/.test(hash) ? `?h=${hash}` : "";
    return { kind: "vimeo", embedUrl: `https://player.vimeo.com/video/${vid}${h}` };
  }
  if (host === "loom.com") {
    const lid = id(path[1]);
    return (path[0] === "share" || path[0] === "embed") && lid
      ? { kind: "loom", embedUrl: `https://www.loom.com/embed/${lid}` }
      : null;
  }
  if (/\.(mp4|webm|mov|m4v)$/i.test(url.pathname)) return { kind: "file", src: url.toString() };
  return null;
}
