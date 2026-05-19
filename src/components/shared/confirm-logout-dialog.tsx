"use client";

import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type ConfirmLogoutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
};

export function ConfirmLogoutDialog({ open, onOpenChange, onConfirm, loading = false }: ConfirmLogoutDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && loading) return;
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-md rounded-2xl border-0 bg-linear-to-b from-white to-slate-50 p-0 shadow-2xl">
        <DialogHeader className="space-y-3 border-b border-slate-100 px-6 pt-6 pb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <DialogTitle>Are you sure you want to log out?</DialogTitle>
          <p className="text-sm text-slate-600">You will need to sign in again to access your dashboard.</p>
        </DialogHeader>
        <DialogFooter className="px-6 pt-4 pb-6 sm:justify-end">
          <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
            Stay logged in
          </Button>
          <Button
            type="button"
            className="rounded-xl bg-rose-600 text-white hover:bg-rose-700"
            onClick={() => void onConfirm()}
            disabled={loading}
          >
            {loading ? "Logging out..." : "Yes, log out"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
