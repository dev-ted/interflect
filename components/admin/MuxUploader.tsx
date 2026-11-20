"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Film,
  Loader2,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

const DEMO_MUX_PLAYBACK_ID = "BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM";
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 150;

export interface MuxUploadResult {
  assetId?: string;
  playbackId: string;
  uploadId?: string;
  durationSeconds?: number;
}

interface MuxUploaderProps {
  playbackId: string;
  assetId?: string;
  muxStatus: "idle" | "waiting" | "ready" | "errored";
  onPlaybackIdChange: (playbackId: string) => void;
  onUploaded: (result: MuxUploadResult) => void;
  onClear?: () => void;
}

type UploadPhase =
  | "idle"
  | "creating"
  | "uploading"
  | "processing"
  | "ready"
  | "error";

interface UploadStatusResponse {
  status?: string;
  assetId?: string | null;
  playbackId?: string | null;
  duration?: number | null;
  error?: string;
}

export function MuxUploader({
  playbackId,
  assetId,
  muxStatus,
  onPlaybackIdChange,
  onUploaded,
  onClear,
}: MuxUploaderProps) {
  const fileInputId = useId();
  const playbackInputId = useId();

  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const pollTimerRef = useRef<number | null>(null);
  const cancelledRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function cleanupActiveTransfer() {
    cancelledRef.current = true;
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
    if (pollTimerRef.current !== null) {
      window.clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }

  useEffect(() => {
    return () => {
      cleanupActiveTransfer();
    };
  }, []);

  function handleCancel() {
    cleanupActiveTransfer();
    setPhase("idle");
    setProgress(0);
    setStatusMessage(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function uploadFileDirect(url: string, file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;

      xhr.open("PUT", url);
      xhr.setRequestHeader(
        "Content-Type",
        file.type || "application/octet-stream",
      );

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && event.total > 0) {
          setProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = () => {
        xhrRef.current = null;
        if (xhr.status >= 200 && xhr.status < 300) {
          setProgress(100);
          resolve();
        } else {
          reject(
            new Error(
              `Direct upload to Mux failed with status ${xhr.status}.`,
            ),
          );
        }
      };

      xhr.onerror = () => {
        xhrRef.current = null;
        reject(new Error("Network error while uploading video to Mux."));
      };

      xhr.onabort = () => {
        xhrRef.current = null;
        reject(new Error("Upload cancelled."));
      };

      xhr.send(file);
    });
  }

  async function pollUntilReady(uploadId: string) {
    let attempts = 0;

    const tick = async () => {
      if (cancelledRef.current) return;
      attempts += 1;

      if (attempts > MAX_POLL_ATTEMPTS) {
        setPhase("error");
        setErrorMessage(
          "Mux is still processing this video. Check your Mux dashboard or paste the Playback ID manually.",
        );
        return;
      }

      try {
        const res = await fetch(`/api/mux/upload/${encodeURIComponent(uploadId)}`, {
          cache: "no-store",
        });
        const data = (await res.json()) as UploadStatusResponse;

        if (!res.ok) {
          throw new Error(data.error || "Failed to check Mux upload status.");
        }

        if (cancelledRef.current) return;

        if (
          data.status === "errored" ||
          data.status === "cancelled" ||
          data.status === "timed_out"
        ) {
          setPhase("error");
          setErrorMessage(`Mux upload ended with status "${data.status}".`);
          return;
        }

        if (data.status === "ready" && data.playbackId) {
          setPhase("ready");
          setStatusMessage("Video encoded and ready for playback.");
          onUploaded({
            assetId: data.assetId ?? undefined,
            playbackId: data.playbackId,
            uploadId,
            durationSeconds:
              typeof data.duration === "number" && data.duration > 0
                ? Math.round(data.duration)
                : undefined,
          });
          return;
        }

        setStatusMessage(
          data.assetId
            ? "Mux asset created — transcoding adaptive HLS streams..."
            : "Waiting for Mux to ingest uploaded video...",
        );

        pollTimerRef.current = window.setTimeout(() => {
          void tick();
        }, POLL_INTERVAL_MS);
      } catch (error) {
        if (cancelledRef.current) return;
        setPhase("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Error while polling Mux asset status.",
        );
      }
    };

    await tick();
  }

  async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    cleanupActiveTransfer();
    cancelledRef.current = false;
    setFileName(file.name);
    setProgress(0);
    setErrorMessage(null);
    setStatusMessage("Requesting direct upload URL from Mux...");
    setPhase("creating");

    try {
      const createRes = await fetch("/api/mux/upload", {
        method: "POST",
      });
      const createData = (await createRes.json()) as {
        uploadId?: string;
        uploadUrl?: string;
        error?: string;
      };

      if (!createRes.ok || !createData.uploadUrl || !createData.uploadId) {
        throw new Error(
          createData.error || "Could not create Mux direct upload URL.",
        );
      }

      if (cancelledRef.current) return;

      setPhase("uploading");
      setStatusMessage(`Uploading ${file.name} directly to Mux...`);
      await uploadFileDirect(createData.uploadUrl, file);

      if (cancelledRef.current) return;

      setPhase("processing");
      setStatusMessage("Upload complete. Waiting for Mux to process video...");
      await pollUntilReady(createData.uploadId);
    } catch (error) {
      if (cancelledRef.current) return;
      setPhase("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Video upload failed.",
      );
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  const isBusy =
    phase === "creating" || phase === "uploading" || phase === "processing";
  const hasPlaybackId = playbackId.trim().length > 0;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
              Direct Upload to Mux Video
            </h3>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Streams video straight from your browser to Mux with adaptive HLS
              encoding.
            </p>
          </div>
          {hasPlaybackId ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/60 dark:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              {muxStatus === "waiting" ? "Processing" : "Mux Ready"}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
              <Film className="h-3.5 w-3.5" aria-hidden="true" />
              No Video Attached
            </span>
          )}
        </div>

        <div className="mt-4">
          <label
            htmlFor={fileInputId}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
              isBusy
                ? "pointer-events-none border-indigo-300 bg-indigo-50/50 dark:border-indigo-800 dark:bg-indigo-950/20"
                : "border-zinc-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/30 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:border-indigo-500/70 dark:hover:bg-indigo-950/20"
            }`}
          >
            {isBusy ? (
              <Loader2
                className="h-7 w-7 animate-spin text-indigo-600 dark:text-indigo-400"
                aria-hidden="true"
              />
            ) : (
              <UploadCloud
                className="h-7 w-7 text-zinc-400 dark:text-zinc-500"
                aria-hidden="true"
              />
            )}
            <span className="mt-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {isBusy
                ? statusMessage || "Working..."
                : "Choose a video file to upload"}
            </span>
            <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {fileName && isBusy
                ? fileName
                : "MP4, MOV, WebM, or MKV — uploaded directly to Mux"}
            </span>
            <input
              ref={fileInputRef}
              id={fileInputId}
              type="file"
              accept="video/*"
              disabled={isBusy}
              onChange={handleFileSelect}
              className="sr-only"
            />
          </label>
        </div>

        {isBusy && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-300">
              <span>
                {phase === "uploading"
                  ? `Uploading (${progress}%)`
                  : phase === "processing"
                    ? "Encoding on Mux..."
                    : "Initializing upload..."}
              </span>
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                <X className="h-3 w-3" aria-hidden="true" />
                Cancel
              </button>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div
                className={`h-full rounded-full bg-indigo-600 transition-all duration-300 ${
                  phase === "processing" || phase === "creating"
                    ? "w-full animate-pulse"
                    : ""
                }`}
                style={
                  phase === "uploading" ? { width: `${progress}%` } : undefined
                }
              />
            </div>
          </div>
        )}

        {phase === "ready" && statusMessage && (
          <div
            role="status"
            className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{statusMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-300"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor={playbackInputId}
            className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400"
          >
            Mux Playback ID (Direct Paste)
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                onPlaybackIdChange(DEMO_MUX_PLAYBACK_ID);
              }}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-950"
            >
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              Use Demo ID
            </button>
            {hasPlaybackId && onClear && (
              <button
                type="button"
                onClick={onClear}
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                <Trash2 className="h-3 w-3" aria-hidden="true" />
                Clear
              </button>
            )}
          </div>
        </div>
        <input
          id={playbackInputId}
          type="text"
          value={playbackId}
          onChange={(e) => onPlaybackIdChange(e.target.value)}
          placeholder="e.g. BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM"
          className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 font-mono text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
        />
        {assetId && (
          <p className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
            Asset ID: {assetId}
          </p>
        )}
      </div>

      {hasPlaybackId && (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-950 dark:border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-1.5 text-[11px] font-medium text-zinc-400">
            <span>Mux Poster Preview</span>
            <span className="font-mono text-zinc-500">
              {playbackId.slice(0, 18)}…
            </span>
          </div>
          <div className="relative aspect-video w-full bg-zinc-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://image.mux.com/${encodeURIComponent(playbackId.trim())}/thumbnail.jpg?width=640&fit_mode=smartcrop`}
              alt="Mux video thumbnail preview"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
}
