"use client";

import { useRef, useState, useTransition } from "react";
import { Download, Eye, Pencil, Trash2, UploadCloud } from "lucide-react";

import { deleteFounderDocument, renameFounderDocument, uploadFounderDocument } from "@/lib/actions/founder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FounderDoc = {
  id: string;
  document_name: string | null;
  document_type: string | null;
  document_url: string | null;
};

export function FounderDocumentsManager({ startupId, docs }: { startupId: string | null; docs: FounderDoc[] }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [documentType, setDocumentType] = useState("legal");
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            value={documentType}
            onChange={(event) => setDocumentType(event.target.value)}
            placeholder="Document type (legal, gst, incorporation...)"
            className="max-w-sm"
          />
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              startTransition(async () => {
                try {
                  const fd = new FormData();
                  fd.append("file", file);
                  fd.append("startupId", startupId ?? "");
                  fd.append("documentType", documentType);
                  await uploadFounderDocument(fd);
                  setStatus("Document uploaded");
                } catch (error) {
                  setStatus(error instanceof Error ? error.message : "Upload failed");
                }
              });
            }}
          />
          <Button onClick={() => fileRef.current?.click()} disabled={isPending}>
            <UploadCloud className="mr-2 h-4 w-4" />
            Upload document
          </Button>
        </div>
        {status ? <p className="mt-2 text-xs text-slate-500">{status}</p> : null}
      </div>

      {docs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          No documents yet. Upload legal docs, GST docs, incorporation docs, pitch decks, and financial statements.
        </div>
      ) : (
        <div className="space-y-3">
          {docs.map((doc) => (
            <div key={doc.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <div>
                <p className="font-medium text-slate-900">{doc.document_name ?? "Untitled document"}</p>
                <p className="text-xs text-slate-500">{doc.document_type ?? "general"}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <a href={doc.document_url ?? "#"} target="_blank" rel="noreferrer">
                    <Eye className="mr-1 h-4 w-4" /> Preview
                  </a>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href={doc.document_url ?? "#"} download>
                    <Download className="mr-1 h-4 w-4" /> Download
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const next = window.prompt("Rename document", doc.document_name ?? "");
                    if (!next?.trim()) return;
                    startTransition(async () => {
                      await renameFounderDocument(doc.id, next.trim());
                    });
                  }}
                >
                  <Pencil className="mr-1 h-4 w-4" /> Rename
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    startTransition(async () => {
                      await deleteFounderDocument(doc.id);
                    });
                  }}
                >
                  <Trash2 className="mr-1 h-4 w-4" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
