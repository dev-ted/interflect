"use client";

import "@videojs/react/video/skin.css";
import { VideoPlayer, VideoSkin } from "@videojs/react/video";
import { MuxVideo } from "@videojs/react/media/mux-video";
import { MuxData } from "@videojs/react/extensions/mux-data";
import { Film } from "lucide-react";

interface MuxVideoPlayerProps {
  playbackId: string | null | undefined;
  title?: string;
}

export function MuxVideoPlayer({ playbackId, title }: MuxVideoPlayerProps) {
  if (!playbackId) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-950 text-center text-zinc-400 dark:border-zinc-800">
        <Film className="h-10 w-10 text-zinc-600" aria-hidden="true" />
        <p className="mt-3 text-sm font-medium text-zinc-200">
          {title ? `${title} — Video uploading soon` : "Video coming soon"}
        </p>
        <p className="mt-1 max-w-sm text-xs text-zinc-500">
          Read the full written guide and complete the interactive quiz below in
          the meantime.
        </p>
      </div>
    );
  }

  const posterUrl = `https://image.mux.com/${playbackId}/thumbnail.webp?width=1280&height=720&fit_mode=smartcrop`;

  return (
    <div className="relative aspect-video w-full overflow-clip rounded-2xl border border-zinc-200/80 bg-black shadow-lg dark:border-zinc-800">
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
