"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import {
  FileInput,
  FileInputDropzone,
  FileInputTrigger,
} from "@ui-sdk/react/file-input";
import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "@ui-sdk/react/progress";
import { CheckCircle2, Loader2, UploadCloud } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface StorageUploaderProps {
  accept: string;
  label: string;
  hint: string;
  rejectMessage: string;
  currentUrl?: string | null;
  disabledReason?: string;
  onStored: (storageId: Id<"_storage">) => Promise<string | null>;
}

export function StorageUploader({
  accept,
  label,
  hint,
  rejectMessage,
  currentUrl,
  disabledReason,
  onStored,
}: StorageUploaderProps) {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const [phase, setPhase] = useState<"idle" | "uploading" | "ready" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const shownUrl = previewUrl ?? currentUrl ?? null;
  const busy = phase === "uploading";

  async function startUpload(file: File) {
    setPhase("uploading");
    setProgress(0);
    setMessage(`Uploading ${file.name}…`);
    try {
      const uploadUrl = await generateUploadUrl();
      const storageId = await postFile(uploadUrl, file, setProgress);
      const url = await onStored(storageId);
      setPreviewUrl(url);
      setPhase("ready");
      setMessage("Saved to Convex storage.");
    } catch (error) {
      setPhase("error");
      setMessage(error instanceof Error ? error.message : "The upload failed. Try again.");
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">{label}</p>
        {phase === "ready" || shownUrl ? (
          <span className="chip">
            <CheckCircle2 className="size-3" aria-hidden="true" />
            Stored
          </span>
        ) : null}
      </div>
      {disabledReason ? (
        <p className="text-sm text-mist">{disabledReason}</p>
      ) : (
        <FileInput
          accept={accept}
          value={[]}
          disabled={busy}
          onValueChange={(files) => {
            if (files[0]) void startUpload(files[0]);
          }}
          onReject={() => {
            setPhase("error");
            setMessage(rejectMessage);
          }}
        >
          <FileInputDropzone className="flex flex-col items-center justify-center rounded-[14px] border border-dashed border-line bg-surface px-4 py-8 text-center transition-colors duration-150 data-disabled:bg-subtle data-drag-accept:border-accent data-drag-accept:bg-accent/5 data-drag-reject:border-danger data-drag-reject:bg-danger/5">
            {busy ? (
              <Loader2 className="h-6 w-6 animate-spin text-accent-ink" aria-hidden="true" />
            ) : (
              <UploadCloud className="h-6 w-6 text-mist" aria-hidden="true" />
            )}
            <p className="mt-2 text-sm font-medium">{busy ? message : "Drop a file here"}</p>
            <p className="mt-0.5 text-xs text-mist">{hint}</p>
            {!busy && (
              <FileInputTrigger className="btn btn-secondary btn-sm mt-3">
                Choose a file
              </FileInputTrigger>
            )}
          </FileInputDropzone>
        </FileInput>
      )}
      {busy && (
        <Progress value={progress} className="space-y-1.5">
          <div className="flex items-center justify-between gap-2 text-xs">
            <ProgressLabel className="font-medium">Uploading</ProgressLabel>
            <ProgressValue className="text-mist tabular-nums" />
          </div>
          <ProgressTrack className="h-1.5 w-full overflow-hidden rounded-full bg-subtle">
            <ProgressIndicator className="h-full rounded-full bg-accent" />
          </ProgressTrack>
        </Progress>
      )}
      {phase === "error" && message ? (
        <p className="text-sm text-danger" role="alert">
          {message}
        </p>
      ) : null}
      {phase === "ready" && message ? <p className="text-sm text-mist">{message}</p> : null}
      {shownUrl && accept.startsWith("image") ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={shownUrl}
          alt=""
          className="h-24 w-40 rounded-[10px] border border-line object-cover"
        />
      ) : null}
      {shownUrl && accept.startsWith("video") ? (
        <video src={shownUrl} controls className="aspect-video w-full rounded-[14px] bg-night" />
      ) : null}
    </div>
  );
}

function postFile(
  uploadUrl: string,
  file: File,
  onProgress: (percent: number) => void,
): Promise<Id<"_storage">> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error("Convex didn't accept the file. Try again."));
        return;
      }
      try {
        const body = JSON.parse(xhr.responseText) as { storageId?: Id<"_storage"> };
        if (!body.storageId) {
          reject(new Error("Convex didn't return a file id."));
          return;
        }
        resolve(body.storageId);
      } catch {
        reject(new Error("Convex returned an unreadable upload response."));
      }
    };
    xhr.onerror = () => reject(new Error("The upload failed before it finished."));
    xhr.send(file);
  });
}
