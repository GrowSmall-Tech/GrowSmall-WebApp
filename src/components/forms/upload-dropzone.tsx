"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { FileUp, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
  fileName?: string;
  isDragging: boolean;
  onDragStateChange: (active: boolean) => void;
  onFileSelect: (file: File | null) => void;
}

export function UploadDropzone({
  fileName,
  isDragging,
  onDragStateChange,
  onFileSelect,
}: UploadDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <motion.div
      whileHover={{ y: -1 }}
      onDragOver={(event) => {
        event.preventDefault();
        onDragStateChange(true);
      }}
      onDragLeave={() => onDragStateChange(false)}
      onDrop={(event) => {
        event.preventDefault();
        onDragStateChange(false);
        const file = event.dataTransfer.files?.[0] ?? null;
        onFileSelect(file);
      }}
      className={cn(
        "rounded-2xl border-2 border-dashed px-6 py-11 text-center transition-colors",
        isDragging ? "border-[#387ED1] bg-[#387ED1]/5" : "border-slate-200 bg-slate-50/30",
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.pptx,.key"
        className="hidden"
        onChange={(event) => onFileSelect(event.target.files?.[0] ?? null)}
      />
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
        <FileUp className="h-7 w-7 text-slate-500" />
      </div>
      <p className="mt-5 text-lg font-medium text-slate-800">
        {fileName ? `Selected: ${fileName}` : "Drag and drop your pitch deck"}
      </p>
      <p className="mt-1 text-sm text-slate-500">Supported formats: PDF, Keynote, PPTX (Max 20MB)</p>
      <Button
        type="button"
        variant="outline"
        className="mt-5 rounded-full"
        onClick={() => fileInputRef.current?.click()}
      >
        <Plus className="mr-2 h-4 w-4" />
        Upload
      </Button>
    </motion.div>
  );
}
