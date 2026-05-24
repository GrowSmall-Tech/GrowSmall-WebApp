"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { deleteStartupAction } from "@/lib/admin/actions";
import type { StartupWithPitch } from "@/types/database";
import { cn } from "@/lib/utils";

const CONFIRM_PHRASE = "DELETE";

export function DeleteStartupModal({
  startup,
  disabled,
}: {
  startup: Pick<StartupWithPitch, "id" | "name" | "industry" | "status">;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [pending, startTransition] = useTransition();

  const canDelete = confirmText === CONFIRM_PHRASE && !pending;

  function handleOpenChange(next: boolean) {
    if (pending) return;
    setOpen(next);
    if (!next) setConfirmText("");
  }

  function handleConfirm() {
    if (!canDelete) return;
    startTransition(() => {
      void deleteStartupAction(startup.id)
        .then(() => {
          toast.success("Startup deleted successfully");
          setConfirmText("");
          setOpen(false);
          router.refresh();
        })
        .catch(() => {
          toast.error("Failed to delete startup");
        });
    });
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled || pending}
        className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
        Delete
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className={cn(
            "max-w-md gap-0 overflow-hidden rounded-xl border-slate-200 p-0 shadow-2xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
          )}
          onPointerDownOutside={(e) => {
            if (pending) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (pending) e.preventDefault();
          }}
        >
          <div className="border-b border-red-100 bg-linear-to-b from-red-50/90 to-white px-6 pb-5 pt-6">
            <DialogHeader className="space-y-3 text-left">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertTriangle className="h-5 w-5" aria-hidden />
              </div>
              <DialogTitle className="text-xl font-semibold text-slate-900">
                Delete Startup
              </DialogTitle>
              <div className="space-y-2 text-sm leading-relaxed text-slate-600">
                <p>
                  Are you sure you want to permanently delete this startup?
                  <br />
                  This action cannot be undone.
                </p>
                <p>
                  <span className="font-medium text-slate-800">Startup:</span>{" "}
                  <span className="font-semibold text-slate-900">{startup.name}</span>
                </p>
                {startup.industry ? (
                  <p className="text-xs text-slate-500">{startup.industry}</p>
                ) : null}
              </div>
            </DialogHeader>
          </div>

          <div className="space-y-4 px-6 py-5">
            <div className="space-y-2">
              <Label htmlFor={`delete-confirm-${startup.id}`} className="text-sm text-slate-700">
                To confirm deletion, type:{" "}
                <span className="font-mono font-semibold text-red-600">{CONFIRM_PHRASE}</span>
              </Label>
              <Input
                id={`delete-confirm-${startup.id}`}
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
                autoComplete="off"
                disabled={pending}
                className="rounded-lg border-slate-200 font-mono text-sm"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 border-t border-slate-100 bg-slate-50/80 px-6 py-4 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="rounded-lg"
              disabled={pending}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-lg bg-red-600 text-white hover:bg-red-700"
              disabled={!canDelete}
              onClick={handleConfirm}
            >
              {pending ? "Deleting..." : "Delete Startup"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
