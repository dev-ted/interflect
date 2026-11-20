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
      <div className="flex aspect-video w-full flex-col items-center justify-center rounded-2xl border-2 border-[#18181B] bg-[#14141D] p-6 text-center text-[#B4B4C6] shadow-[5px_5px_0_0_#111116] dark:border-[#3A3A52] dark:shadow-[5px_5px_0_0_#000000]">
        <span className="flex h-12 w-12 -rotate-3 items-center justify-center rounded-2xl border-2 border-[#111116] bg-[#FFB800] text-[#111116] shadow-[3px_3px_0_0_#000000]">
          <Film className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="font-display mt-4 text-base font-extrabold text-[#FAFAF5]">
          {title ? `${title} — Video uploading soon` : "Video coming soon"}
        </p>
        <p className="mt-1 max-w-sm text-xs text-[#B4B4C6]">
          Read the full written guide and complete the interactive quiz below in
          the meantime.
        </p>
      </div>
    );
  }

  const posterUrl = `https://image.mux.com/${playbackId}/thumbnail.webp?width=1280&height=720&fit_mode=smartcrop`;

  return (
    <div className="relative aspect-video w-full overflow-clip rounded-2xl border-2 border-[#18181B] bg-black shadow-[5px_5px_0_0_#111116] dark:border-[#3A3A52] dark:shadow-[5px_5px_0_0_#000000]">
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
