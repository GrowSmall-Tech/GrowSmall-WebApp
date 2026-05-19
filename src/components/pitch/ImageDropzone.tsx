"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ImageIcon, Trash2, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageDropzoneProps {
  label: string;
  description?: string;
  helper?: string;
  aspect?: "square" | "wide";
  file?: File | null;
  remoteUrl?: string | null;
  error?: string;
  required?: boolean;
  maxSizeMb?: number;
  onFileSelect: (file: File | null) => void;
}

const VALID_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif"];

export function ImageDropzone({
  label,
  description,
  helper,
  aspect = "wide",
  file,
  remoteUrl,
  error,
  required,
  maxSizeMb = 5,
  onFileSelect,
}: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalError, setInternalError] = useState<string | null>(null);

  const filePreview = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    if (!filePreview) return;
    return () => URL.revokeObjectURL(filePreview);
  }, [filePreview]);

  const previewSrc = file ? (filePreview ?? remoteUrl) : (remoteUrl ?? null);
  const visibleError = error ?? internalError;

  const handleFile = (next: File | null) => {
    setInternalError(null);
    if (!next) {
      onFileSelect(null);
      return;
    }
    if (!VALID_TYPES.includes(next.type)) {
      setInternalError("Use JPG, PNG, WEBP or SVG images.");
      return;
    }
    if (next.size > maxSizeMb * 1024 * 1024) {
      setInternalError(`Max file size is ${maxSizeMb}MB.`);
      return;
    }
    onFileSelect(next);
  };

  const aspectClasses = aspect === "square" ? "aspect-square" : "aspect-[16/9]";

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          {label}
          {required ? <span className="ml-0.5 text-red-500">*</span> : null}
        </label>
        {helper ? <span className="text-[11px] text-slate-400">{helper}</span> : null}
      </div>
      <motion.div
        whileHover={{ y: -1 }}
        transition={{ duration: 0.2 }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          handleFile(event.dataTransfer.files?.[0] ?? null);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative cursor-pointer overflow-hidden rounded-2xl border border-dashed transition",
          aspectClasses,
          previewSrc
            ? "border-[#387ED1]/40 bg-[#387ED1]/5"
            : "border-slate-300 bg-slate-50 hover:border-[#387ED1]/40",
          visibleError ? "border-red-300 bg-red-50/30" : "",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
        />

        {previewSrc ? (
          <>
            <Image
              src={previewSrc}
              alt={`${label} preview`}
              fill
              sizes="(max-width: 768px) 100vw, 480px"
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-linear-to-t from-slate-950/55 via-slate-900/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-2 p-3">
              <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-slate-700 backdrop-blur">
                {file?.name ?? "Uploaded"}
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full border-white/60 bg-white/90 text-xs text-slate-700 hover:bg-white"
                  onClick={(event) => {
                    event.stopPropagation();
                    inputRef.current?.click();
                  }}
                >
                  Replace
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full border-white/60 bg-white/90 text-xs text-red-600 hover:bg-white"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleFile(null);
                  }}
                >
                  <Trash2 className="mr-1 h-3.5 w-3.5" />
                  Remove
                </Button>
              </div>
            </div>
            {file ? (
              <motion.div
                key={`${file.name}-${file.size}-${file.lastModified}`}
                className="absolute inset-x-0 top-0 h-1 overflow-hidden bg-white/50"
              >
                <motion.div
                  className="h-full bg-[#387ED1]"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                />
              </motion.div>
            ) : null}
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
              {aspect === "square" ? (
                <ImageIcon className="h-5 w-5 text-[#387ED1]" />
              ) : (
                <UploadCloud className="h-5 w-5 text-[#387ED1]" />
              )}
            </div>
            <p className="text-sm font-medium text-slate-700">{description ?? "Click to upload or drag & drop"}</p>
            <p className="text-xs text-slate-500">JPG, PNG, WEBP up to {maxSizeMb}MB</p>
          </div>
        )}
      </motion.div>
      {visibleError ? <p className="text-xs text-red-500">{visibleError}</p> : null}
    </div>
  );
}
