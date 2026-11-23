"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "@ui-sdk/react/progress";
import {
  FileInput,
  FileInputDropzone,
  FileInputTrigger,
} from "@ui-sdk/react/file-input";
import { AlertCircle, CheckCircle2, Loader2, UploadCloud } from "lucide-react";

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
  const playbackInputId = useId();

  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const pollTimerRef = useRef<number | null>(null);
  const cancelledRef = useRef(false);
  const [lastFile, setLastFile] = useState<File | null>(null);

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
              `Mux rejected the upload (status ${xhr.status}). Try again, or choose a smaller file.`,
            ),
          );
        }
      };

      xhr.onerror = () => {
        xhrRef.current = null;
        reject(new Error("The connection dropped during upload. Check your network and try again."));
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
          "Mux is still processing this video. Check the Mux dashboard, or paste the playback ID below once it\u2019s ready.",
        );
        return;
      }

      try {
        const res = await fetch(`/api/mux/upload/${encodeURIComponent(uploadId)}`, {
          cache: "no-store",
        });
        const data = (await res.json()) as UploadStatusResponse;

        if (!res.ok) {
          throw new Error(data.error || "Couldn't check the upload status with Mux.");
        }

        if (cancelledRef.current) return;

        if (
          data.status === "errored" ||
          data.status === "cancelled" ||
          data.status === "timed_out"
        ) {
          setPhase("error");
          setErrorMessage(`Mux stopped the upload (${data.status}). Try again, or choose a different file.`);
          return;
        }

        if (data.status === "ready" && data.playbackId) {
          setPhase("ready");
          setStatusMessage("Video is ready to play.");
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
            ? "Mux is preparing the video stream\u2026"
            : "Waiting for Mux to receive the video\u2026",
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
            : "Couldn't check the upload status with Mux.",
        );
      }
    };

    await tick();
  }

  async function startUpload(file: File) {
    cleanupActiveTransfer();
    cancelledRef.current = false;
    setLastFile(file);
    setFileName(file.name);
    setProgress(0);
    setErrorMessage(null);
    setStatusMessage("Preparing the upload\u2026");
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
          createData.error ||
            "Mux didn't accept the upload request. Check the Mux keys in your environment, then try again.",
        );
      }

      if (cancelledRef.current) return;

      setPhase("uploading");
      setStatusMessage(`Uploading ${file.name}\u2026`);
      await uploadFileDirect(createData.uploadUrl, file);

      if (cancelledRef.current) return;

      setPhase("processing");
      setStatusMessage("Upload complete. Mux is processing the video\u2026");
      await pollUntilReady(createData.uploadId);
    } catch (error) {
      if (cancelledRef.current) return;
      setPhase("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The upload failed before it finished. Try again.",
      );
    }
  }

  const isBusy =
    phase === "creating" || phase === "uploading" || phase === "processing";
  const hasPlaybackId = playbackId.trim().length > 0;

  return (
    <div className="space-y-5">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium">Upload a video</p>
          <span className="chip">
            {hasPlaybackId
              ? muxStatus === "waiting"
                ? "Processing"
                : "Video ready"
              : "No video yet"}
          </span>
        </div>

        <FileInput
          accept="video/*"
          value={[]}
          disabled={isBusy}
          onValueChange={(files) => {
            if (files[0]) void startUpload(files[0]);
          }}
          onReject={() => {
            setPhase("error");
            setErrorMessage(
              "That file isn\u2019t a video. Choose an MP4, MOV, WebM or MKV file and try again.",
            );
          }}
        >
          <FileInputDropzone className="mt-2 flex flex-col items-center justify-center rounded-[14px] border border-dashed border-line bg-surface px-4 py-8 text-center transition-colors duration-150 data-disabled:border-accent data-disabled:bg-subtle data-drag-accept:border-accent data-drag-accept:bg-accent/5 data-drag-reject:border-danger data-drag-reject:bg-danger/5">
            {isBusy ? (
              <Loader2 className="h-6 w-6 animate-spin text-accent-ink" aria-hidden="true" />
            ) : (
              <UploadCloud className="h-6 w-6 text-mist" aria-hidden="true" />
            )}
            <p className="mt-2 text-sm font-medium">
              {isBusy ? statusMessage || "Working\u2026" : "Drop a video here"}
            </p>
            <p className="mt-0.5 text-xs text-mist">
              {fileName && isBusy
                ? fileName
                : "MP4, MOV, WebM or MKV. Uploads straight to Mux."}
            </p>
            {!isBusy && (
              <FileInputTrigger className="btn btn-secondary btn-sm mt-3">
                Choose a file
              </FileInputTrigger>
            )}
          </FileInputDropzone>
        </FileInput>

        {isBusy && (
          <Progress
            value={phase === "uploading" ? progress : null}
            className="mt-3 space-y-1.5"
          >
            <div className="flex items-center justify-between gap-2 text-xs">
              <ProgressLabel className="font-medium">
                {phase === "uploading"
                  ? "Uploading"
                  : phase === "processing"
                    ? "Processing on Mux"
                    : "Preparing upload"}
              </ProgressLabel>
              <span className="flex items-center gap-2">
                <ProgressValue className="text-mist tabular-nums" />
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-ghost btn-sm"
                >
                  Cancel upload
                </button>
              </span>
            </div>
            <ProgressTrack className="h-1.5 w-full overflow-hidden rounded-full bg-subtle">
              <ProgressIndicator className="h-full rounded-full bg-accent data-indeterminate:w-full data-indeterminate:motion-safe:animate-pulse" />
            </ProgressTrack>
          </Progress>
        )}

        {phase === "ready" && statusMessage && (
          <p role="status" className="mt-3 flex items-center gap-2 text-sm text-success">
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            {statusMessage}
          </p>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="mt-3 flex items-start gap-2 rounded-[10px] border border-danger/30 bg-danger/5 px-3 py-2.5 text-sm text-danger"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p className="min-w-0 flex-1">{errorMessage}</p>
            {phase === "error" && lastFile && (
              <button
                type="button"
                onClick={() => {
                  void startUpload(lastFile);
                }}
                className="btn btn-ghost btn-sm -my-1 shrink-0"
              >
                Try again
              </button>
            )}
          </div>
        )}
      </div>

      <div>
        <label htmlFor={playbackInputId} className="block text-sm font-medium">
          Or paste a Mux playback ID
        </label>
        <input
          id={playbackInputId}
          type="text"
          value={playbackId}
          onChange={(e) => onPlaybackIdChange(e.target.value)}
          placeholder={DEMO_MUX_PLAYBACK_ID}
          className="field mt-1.5 font-mono text-xs"
        />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setErrorMessage(null);
              onPlaybackIdChange(DEMO_MUX_PLAYBACK_ID);
            }}
            className="btn btn-secondary btn-sm"
          >
            Use demo video
          </button>
          {hasPlaybackId && onClear && (
            <button type="button" onClick={onClear} className="btn btn-ghost btn-sm">
              Remove video
            </button>
          )}
          {assetId && (
            <span className="ml-auto truncate font-mono text-xs text-mist">
              Asset {assetId}
            </span>
          )}
        </div>
      </div>

      {hasPlaybackId && (
        <figure className="overflow-hidden rounded-[14px] border border-line bg-night">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://image.mux.com/${encodeURIComponent(playbackId.trim())}/thumbnail.jpg?width=640&fit_mode=smartcrop`}
            alt="Poster frame of the attached video"
            className="aspect-video w-full object-cover"
          />
        </figure>
      )}
    </div>
  );
}
