"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FileUp, Loader2, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  KYC_ACCEPTED_TYPES,
  KYC_MAX_BYTES,
  validateKycFile,
} from "@/lib/auth/investor-status";
import { cn } from "@/lib/utils";

const accept = ".pdf,.jpg,.jpeg,.png";

export type KycUploadProps = {
  id: string;
  label: string;
  hint: string;
  docTypes: readonly string[];
  file: File | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string | null;
};

export function KycUpload({
  id,
  label,
  hint,
  docTypes,
  file,
  onFileChange,
  disabled = false,
  required = true,
  error: externalError,
}: KycUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successPulse, setSuccessPulse] = useState(false);

  const applyFile = useCallback(
    (next: File | null) => {
      setLocalError(null);
      if (!next) {
        onFileChange(null);
        setProgress(0);
        return;
      }
      const validation = validateKycFile(next);
      if (validation) {
        setLocalError(validation);
        onFileChange(null);
        return;
      }
      setProgress(12);
      const timer = window.setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            window.clearInterval(timer);
            return 100;
          }
          return p + 18;
        });
      }, 40);
      window.setTimeout(() => {
        onFileChange(next);
        setSuccessPulse(true);
        window.setTimeout(() => setSuccessPulse(false), 700);
      }, 280);
    },
    [onFileChange],
  );

  const displayError = externalError ?? localError;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-semibold text-slate-900">
          {label}
          {required ? <span className="text-red-500"> *</span> : null}
        </label>
        <span className="text-[11px] text-slate-500">Max 10MB · PDF, JPG, PNG</span>
      </div>
      <p className="text-xs text-slate-500">
        {hint}{" "}
        <span className="text-slate-400">
          ({docTypes.join(" · ")})
        </span>
      </p>

      <motion.div
        animate={successPulse ? { scale: [1, 1.01, 1] } : { scale: 1 }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (disabled) return;
          applyFile(e.dataTransfer.files?.[0] ?? null);
        }}
        className={cn(
          "relative rounded-xl border-2 border-dashed px-4 py-6 transition-colors",
          dragging
            ? "border-[#387ED1] bg-[#387ED1]/5"
            : file
              ? "border-emerald-200 bg-emerald-50/40"
              : "border-slate-200 bg-slate-50/50",
          disabled && "pointer-events-none opacity-60",
        )}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          className="sr-only"
          disabled={disabled}
          onChange={(e) => applyFile(e.target.files?.[0] ?? null)}
        />

        <div className="flex flex-col items-center text-center">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full",
              file ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500",
            )}
          >
            {disabled && progress > 0 && progress < 100 ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <FileUp className="h-5 w-5" />
            )}
          </div>

          {file ? (
            <div className="mt-3 w-full max-w-sm">
              <p className="truncate text-sm font-medium text-slate-800">{file.name}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {(file.size / 1024).toFixed(0)} KB
              </p>
              <div className="mt-3 flex justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg"
                  disabled={disabled}
                  onClick={() => inputRef.current?.click()}
                >
                  <Upload className="mr-1.5 h-3.5 w-3.5" />
                  Replace
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700"
                  disabled={disabled}
                  onClick={() => {
                    applyFile(null);
                    if (inputRef.current) inputRef.current.value = "";
                  }}
                >
                  <X className="mr-1.5 h-3.5 w-3.5" />
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="mt-3 text-sm font-medium text-slate-800">
                Drag and drop your document
              </p>
              <p className="mt-1 text-xs text-slate-500">or browse from your device</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4 h-9 rounded-lg"
                disabled={disabled}
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Choose file
              </Button>
            </>
          )}
        </div>

        {progress > 0 && progress < 100 ? (
          <div className="mt-4 px-2">
            <Progress value={progress} className="h-1.5" />
          </div>
        ) : null}
      </motion.div>

      {displayError ? (
        <p className="text-sm text-red-600">{displayError}</p>
      ) : null}

      <p className="sr-only">
        Accepted MIME types: {KYC_ACCEPTED_TYPES.join(", ")}. Maximum size{" "}
        {KYC_MAX_BYTES} bytes.
      </p>
    </div>
  );
}
