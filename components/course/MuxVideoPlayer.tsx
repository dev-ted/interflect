"use client";

import "@videojs/react/video/skin.css";
import { VideoPlayer, VideoSkin } from "@videojs/react/video";
import { MuxVideo } from "@videojs/react/media/mux-video";
import { MuxData } from "@videojs/react/extensions/mux-data";
import { useMemo, type Ref } from "react";
import { Film } from "lucide-react";
import { parseVideoUrl } from "@/convex/lib/video";

interface MuxVideoPlayerProps {
  playbackId: string | null | undefined;
  /** A pasted YouTube, Vimeo, Loom or file link, used when there's no Mux upload. */
  videoUrl?: string | null;
  /** A Convex storage URL for an uploaded lesson file. Played ahead of Mux and links. */
  videoFileUrl?: string | null;
  title?: string;
  /** Caption cues for the uploaded file. Shown through the player's own CC control. */
  captions?: CaptionCue[] | null;
  /** The uploaded file's video element, so the transcript can seek it. */
  ref?: Ref<HTMLVideoElement>;
}

export interface CaptionCue {
  start: number;
  end: number;
  text: string;
}

function vttTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = (seconds % 60).toFixed(3).padStart(6, "0");
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${s}`;
}

/** WebVTT as a data: URL, so <track> works with a cross-origin video without CORS. */
function captionsUrl(cues: CaptionCue[] | null | undefined) {
  if (!cues?.length) return null;
  const body = cues.map((c) => `${vttTime(c.start)} --> ${vttTime(c.end)}\n${c.text}`).join("\n\n");
  return `data:text/vtt;charset=utf-8,${encodeURIComponent(`WEBVTT\n\n${body}\n`)}`;
}

const frame = "relative aspect-video w-full overflow-clip rounded-xl bg-night";

/** Plays a lesson video from Mux, or from a pasted link. */
export function MuxVideoPlayer({
  playbackId,
  videoUrl,
  videoFileUrl,
  title = "Lesson video",
  captions,
  ref,
}: MuxVideoPlayerProps) {
  const trackSrc = useMemo(() => captionsUrl(videoFileUrl ? captions : null), [videoFileUrl, captions]);

  if (videoFileUrl) {
    return (
      <div className={frame}>
        <video
          ref={ref}
          src={videoFileUrl}
          controls
          playsInline
          preload="metadata"
          className="h-full w-full"
          aria-label={title}
        >
          {trackSrc && <track kind="captions" srcLang="en" label="English" src={trackSrc} />}
        </video>
      </div>
    );
  }

  if (playbackId) {
    const posterUrl = `https://image.mux.com/${playbackId}/thumbnail.webp?width=1280&height=720&fit_mode=smartcrop`;
    return (
      <div className={frame}>
        <VideoPlayer key={playbackId}>
          <VideoSkin className="block h-full w-full" style={{ aspectRatio: "16 / 9" }}>
            <MuxVideo
              className="block h-full w-full"
              width={1280}
              height={720}
              poster={posterUrl}
              source={{ playbackId }}
              playsInline
            />
            <MuxData />
          </VideoSkin>
        </VideoPlayer>
      </div>
    );
  }

  const parsed = videoUrl ? parseVideoUrl(videoUrl) : null;
  if (parsed?.kind === "file") {
    return (
      <div className={frame}>
        <video src={parsed.src} controls playsInline preload="metadata" className="h-full w-full" aria-label={title} />
      </div>
    );
  }
  if (parsed) {
    return (
      <div className={frame}>
        <iframe
          src={parsed.embedUrl}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }

  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl border border-line bg-subtle p-6 text-center text-ink">
      <Film className="h-6 w-6 text-mist" aria-hidden="true" />
      <p className="mt-3 font-semibold">Video coming soon</p>
      <p className="mt-1 max-w-sm text-sm text-mist">
        The written guide and quiz below cover this lesson in the meantime.
      </p>
    </div>
  );
}
