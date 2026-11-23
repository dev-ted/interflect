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

export function MuxVideoPlayer({ playbackId }: MuxVideoPlayerProps) {
  if (!playbackId) {
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

  const posterUrl = `https://image.mux.com/${playbackId}/thumbnail.webp?width=1280&height=720&fit_mode=smartcrop`;

  return (
    <div className="relative aspect-video w-full overflow-clip rounded-xl bg-night">
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
