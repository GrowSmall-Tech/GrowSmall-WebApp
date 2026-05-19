"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { FileText, Trash2, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
  file: File | null;
  progress: number;
  error?: string;
  onFileSelect: (file: File | null) => void;
}

export function UploadDropzone({ file, progress, error, onFileSelect }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Pitch Deck</p>
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          onFileSelect(event.dataTransfer.files?.[0] ?? null);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "cursor-pointer rounded-xl border border-dashed bg-slate-50 px-5 py-8 text-center transition",
          file ? "border-[#387ED1]/40 bg-[#387ED1]/5" : "border-slate-300 hover:border-[#387ED1]/40",
          error ? "border-red-300" : "",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.ppt,.pptx"
          className="hidden"
          onChange={(event) => onFileSelect(event.target.files?.[0] ?? null)}
        />

        {!file ? (
          <>
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
              <UploadCloud className="h-5 w-5 text-[#387ED1]" />
            </div>
            <p className="mt-3 text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
            <p className="mt-1 text-xs text-slate-500">PDF, PPT, PPTX (Max 20MB)</p>
          </>
        ) : (
          <div className="space-y-3">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
              <FileText className="h-5 w-5 text-[#387ED1]" />
            </div>
            <p className="text-sm font-medium text-slate-800">{file.name}</p>
            <p className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            <div className="mx-auto h-2 max-w-sm overflow-hidden rounded-full bg-slate-200">
              <motion.div
                className="h-full bg-[#387ED1]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={(event) => {
                event.stopPropagation();
                inputRef.current?.click();
              }}
            >
              Replace file
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={(event) => {
                event.stopPropagation();
                onFileSelect(null);
              }}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Remove file
            </Button>
          </div>
        )}
      </motion.div>
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
