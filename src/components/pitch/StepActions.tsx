"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface StepActionsProps {
  disableBack?: boolean;
  loading?: boolean;
  isFinal?: boolean;
  continueText?: string;
  finalText?: string;
  loadingText?: string;
  onBack: () => void;
  onContinue: () => void;
}

export function StepActions({
  disableBack,
  loading = false,
  isFinal = false,
  continueText = "Continue",
  finalText = "Submit Pitch",
  loadingText,
  onBack,
  onContinue,
}: StepActionsProps) {
  const fallbackLoading = loadingText ?? (isFinal ? "Submitting..." : "Saving...");
  const label = loading ? fallbackLoading : isFinal ? finalText : continueText;

  return (
    <div className="flex items-center justify-between pt-2">
      <Button
        type="button"
        variant="outline"
        disabled={disableBack || loading}
        className="min-w-24 rounded-xl"
        onClick={onBack}
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Back
      </Button>
      <motion.div whileHover={loading ? {} : { y: -1 }}>
        <Button
          type="button"
          disabled={loading}
          className="min-w-32 rounded-xl"
          onClick={onContinue}
        >
          {loading ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : null}
          {label}
          {!loading && !isFinal ? <ArrowRight className="ml-1.5 h-4 w-4" /> : null}
        </Button>
      </motion.div>
    </div>
  );
}
