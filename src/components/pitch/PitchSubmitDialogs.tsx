"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, ShieldCheck, Sparkles } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SubmitConfirmDialogProps {
  open: boolean;
  startupName: string;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function SubmitConfirmDialog({
  open,
  startupName,
  loading,
  onConfirm,
  onClose,
}: SubmitConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(value) => (!value ? onClose() : undefined)}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#387ED1]/10">
            <ShieldCheck className="h-6 w-6 text-[#387ED1]" />
          </div>
          <DialogTitle>Submit {startupName || "your startup"} for review?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-600">
          Your pitch will be locked for review and visible to the GrowSmall admin team. You can still
          come back and create another startup later, but this draft can&apos;t be edited until the
          review is complete.
        </p>
        <DialogFooter className="mt-2 gap-2">
          <Button type="button" variant="outline" disabled={loading} onClick={onClose}>
            Keep editing
          </Button>
          <Button type="button" disabled={loading} onClick={onConfirm}>
            {loading ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Sparkles className="mr-1.5 h-4 w-4" /> Submit for review
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface SubmitSuccessDialogProps {
  open: boolean;
  startupName: string;
  onCreateAnother: () => void;
  onClose: () => void;
}

export function SubmitSuccessDialog({
  open,
  startupName,
  onCreateAnother,
  onClose,
}: SubmitSuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(value) => (!value ? onClose() : undefined)}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 18 }}
            className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50"
          >
            <CheckCircle2 className="h-7 w-7 text-emerald-600" />
          </motion.div>
          <DialogTitle>Pitch Submitted Successfully</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-600">
          <strong>{startupName || "Your startup"}</strong> has been submitted for admin review. Once
          approved, it will appear in the Explore section for investors. You&apos;ll get a
          notification on this dashboard the moment your status changes.
        </p>
        <DialogFooter className="mt-2 gap-2">
          <Button asChild variant="outline">
            <Link href="/founder/dashboard">View Dashboard</Link>
          </Button>
          <Button type="button" onClick={onCreateAnother}>
            Submit Another Startup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
