"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Card } from "@/components/ui/card";
import { founderPitchWorkspaceContent, founderWorkspaceProfile } from "@/config/founder-workspace";

import { SubmissionTracker } from "./submission-tracker";
import { ActionFooter } from "../../forms/action-footer";
import { ExecutiveSummaryField } from "../../forms/executive-summary-field";
import { UploadDropzone } from "../../forms/upload-dropzone";
import { VideoPitchCard } from "../../forms/video-pitch-card";

const pitchSubmissionSchema = z.object({
  executiveSummary: z
    .string()
    .trim()
    .min(40, "Please add at least 40 characters.")
    .max(280, "Executive summary must be within 280 characters."),
  pitchDeck: z
    .instanceof(File, { message: "Please upload a file in PDF/PPTX/Keynote format." })
    .nullable()
    .refine((file) => file !== null, {
      message: "Please upload your pitch deck.",
    })
    .refine((file) => {
      if (!file) return false;
      return file.size <= 20 * 1024 * 1024;
    }, "File size must be below 20MB."),
});

type PitchSubmissionValues = z.input<typeof pitchSubmissionSchema>;

export function PitchSubmissionWorkspace() {
  const [isDragging, setIsDragging] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const form = useForm<PitchSubmissionValues>({
    resolver: zodResolver(pitchSubmissionSchema),
    mode: "onChange",
    defaultValues: {
      executiveSummary: "",
      pitchDeck: null,
    },
  });

  const summaryValue = useWatch({ control: form.control, name: "executiveSummary" }) ?? "";
  const selectedDeck = useWatch({ control: form.control, name: "pitchDeck" });

  function triggerAutoSave() {
    setIsSavingDraft(true);
    window.setTimeout(() => setIsSavingDraft(false), 900);
  }

  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-start justify-between gap-4"
      >
        <div className="max-w-3xl">
          <h1 className="text-5xl font-semibold tracking-tight text-slate-900">
            {founderPitchWorkspaceContent.title}
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-slate-500">{founderPitchWorkspaceContent.subtitle}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400">Target Range</p>
          <p className="text-[42px] leading-none font-semibold text-slate-900">
            {founderWorkspaceProfile.targetRange}
          </p>
        </div>
      </motion.section>

      <div className="grid gap-6 xl:grid-cols-[330px_minmax(0,1fr)]">
        <SubmissionTracker />

        <Card className="rounded-3xl border-slate-200 p-6 sm:p-8">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold tracking-[0.08em] text-[#387ED1] uppercase">
                {founderPitchWorkspaceContent.stepLabel}
              </p>
              <h2 className="mt-2 text-4xl font-semibold text-slate-900">
                {founderPitchWorkspaceContent.sectionTitle}
              </h2>
            </div>
            <p className="text-sm text-slate-400">{isSavingDraft ? "Auto-saving..." : "All changes saved"}</p>
          </div>

          <form
            className="space-y-6"
            onSubmit={form.handleSubmit(() => {
              setIsSavingDraft(true);
              window.setTimeout(() => setIsSavingDraft(false), 1000);
            })}
          >
            <div>
              <p className="mb-3 text-sm font-medium text-slate-800">
                {founderPitchWorkspaceContent.uploadTitle}
              </p>
              <UploadDropzone
                isDragging={isDragging}
                onDragStateChange={setIsDragging}
                fileName={selectedDeck?.name}
                onFileSelect={(file) => {
                  form.setValue("pitchDeck", file, { shouldValidate: true, shouldDirty: true });
                  triggerAutoSave();
                }}
              />
              {form.formState.errors.pitchDeck?.message ? (
                <p className="mt-2 text-xs text-rose-500">{form.formState.errors.pitchDeck.message}</p>
              ) : null}
            </div>

            <ExecutiveSummaryField
              value={summaryValue}
              maxLength={founderPitchWorkspaceContent.summaryLimit}
              error={form.formState.errors.executiveSummary}
              onChange={(value) => {
                form.setValue("executiveSummary", value, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                triggerAutoSave();
              }}
            />

            <VideoPitchCard />
            <ActionFooter isSaving={isSavingDraft} />
          </form>
        </Card>
      </div>
      <div className="flex justify-center gap-4 py-2">
        <span className="h-3 w-3 rounded-sm bg-slate-300" />
        <span className="h-3 w-3 rounded-sm bg-slate-300" />
        <span className="h-3 w-3 rounded-sm bg-[#387ED1]/30" />
      </div>
    </div>
  );
}
