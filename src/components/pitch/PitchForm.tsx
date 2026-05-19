"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { ImageDropzone } from "@/components/pitch/ImageDropzone";
import { PitchFormCard } from "@/components/pitch/PitchFormCard";
import { PitchStepper } from "@/components/pitch/PitchStepper";
import { ReviewPreview } from "@/components/pitch/ReviewPreview";
import { StepActions } from "@/components/pitch/StepActions";
import { SubmitConfirmDialog, SubmitSuccessDialog } from "@/components/pitch/PitchSubmitDialogs";
import { UploadDropzone } from "@/components/pitch/UploadDropzone";
import { CurrencyInput } from "@/components/pitch/CurrencyInput";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TextareaField } from "@/components/pitch/TextareaField";
import { toast } from "@/components/ui/toast";
import { getPitchDraft, savePitchDraft, submitPitch } from "@/lib/actions/pitch";
import {
  mapStartupRowToPitchForm,
  pitchFormEmptyDefaults,
  resolvePitchFormStep,
  resolvePitchStepsComplete,
} from "@/lib/mappers/pitch-draft";
import {
  industryOptions,
  pitchDeckSchema,
  pitchSchema,
  stageOptions,
  type PitchFormInputValues,
  type PitchFormValues,
} from "@/lib/validation/pitch-schema";
import type { PitchStepKey } from "@/types/pitch";
import { usePitchFormStore } from "@/store/pitch-form-store";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const DRAFT_KEY = "growsmall.pitch.draft.v1";

const stepOrder: Array<{ key: PitchStepKey; label: string }> = [
  { key: "basics", label: "Startup" },
  { key: "problem", label: "Problem" },
  { key: "financials", label: "Financials" },
  { key: "deck", label: "Media" },
  { key: "founder", label: "Founder" },
  { key: "review", label: "Review" },
];

type PitchDraftData = Awaited<ReturnType<typeof getPitchDraft>>;

const stepFieldMap: Record<PitchStepKey, Array<keyof PitchFormInputValues>> = {
  basics: ["startupName", "tagline", "category", "location", "industry", "stage"],
  problem: ["problem", "solution", "businessModel", "targetMarket"],
  financials: ["annualRevenue", "netProfit", "burnRate", "customers", "askAmount", "valuation", "equityOffered"],
  deck: ["pitchDeck"],
  founder: ["founderBio", "founderLinkedIn", "founderExperience", "teamMembers"],
  review: [],
};

function parseNumberList(value: string): number[] {
  return value
    .split(/[,\n]/)
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => Number(token.replace(/[^\d.-]/g, "")))
    .filter((n) => Number.isFinite(n));
}

function stripFileFields(
  values: PitchFormInputValues,
): Omit<PitchFormInputValues, "pitchDeck" | "startupLogo" | "coverImage"> {
  const { pitchDeck: _pitchDeck, startupLogo: _logo, coverImage: _cover, ...rest } = values;
  void _pitchDeck;
  void _logo;
  void _cover;
  return rest;
}

function smoothScrollTop() {
  if (typeof window === "undefined") return;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function syncDraftMedia(
  startup: Record<string, unknown>,
  submission: Record<string, unknown> | null | undefined,
  setters: {
    setLogoPreview: (url: string | null) => void;
    setCoverPreview: (url: string | null) => void;
    setPitchDeckRemoteUrl: (url: string | null) => void;
    setMonthlyRevenueText: (text: string) => void;
    setQuarterlyUsersText: (text: string) => void;
  },
  mapped: PitchFormInputValues,
) {
  setters.setLogoPreview((startup.logo_url as string | null) ?? null);
  setters.setCoverPreview(
    (startup.cover_image_url as string | null) ?? (startup.banner_url as string | null) ?? null,
  );
  setters.setPitchDeckRemoteUrl(
    (startup.pitch_deck_url as string | null) ?? (submission?.pitch_deck_url as string | null) ?? null,
  );
  if (mapped.monthlyRevenue?.length) {
    setters.setMonthlyRevenueText(mapped.monthlyRevenue.join(", "));
  }
  if (mapped.quarterlyUsers?.length) {
    setters.setQuarterlyUsersText(mapped.quarterlyUsers.join(", "));
  }
}

export function PitchForm({
  pitchId,
  initialDraft = null,
}: {
  pitchId: string;
  initialDraft?: PitchDraftData;
}) {
  const router = useRouter();

  const initialFormValues = useMemo(() => {
    if (!initialDraft?.startup) return pitchFormEmptyDefaults;
    return mapStartupRowToPitchForm(initialDraft.startup as Record<string, unknown>, {
      founder: initialDraft.founder,
      burnRate: initialDraft.burnRate,
    });
  }, [initialDraft]);

  const initialStep = useMemo(() => {
    if (!initialDraft?.submission) return 1;
    return Math.max(
      1,
      Math.min(stepOrder.length, resolvePitchFormStep(initialDraft.submission as Record<string, unknown>)),
    );
  }, [initialDraft]);

  const initialStepsComplete = useMemo(
    () => resolvePitchStepsComplete(initialDraft?.submission as Record<string, unknown> | undefined),
    [initialDraft],
  );

  const [currentStep, setCurrentStep] = useState(initialStep);
  const [stepsComplete, setStepsComplete] = useState(initialStepsComplete);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [continueLoading, setContinueLoading] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [autosaveLabel, setAutosaveLabel] = useState<string>(
    initialDraft?.startup ? "Loaded from saved pitch" : "Draft synced",
  );
  const [isHydrated, setIsHydrated] = useState(Boolean(initialDraft?.startup));
  const initialized = useRef(false);
  const initialStartup = initialDraft?.startup as Record<string, unknown> | undefined;
  const [logoPreview, setLogoPreview] = useState<string | null>(
    (initialStartup?.logo_url as string | null) ?? null,
  );
  const [coverPreview, setCoverPreview] = useState<string | null>(
    (initialStartup?.cover_image_url as string | null) ??
      (initialStartup?.banner_url as string | null) ??
      null,
  );
  const [pitchDeckRemoteUrl, setPitchDeckRemoteUrl] = useState<string | null>(
    (initialStartup?.pitch_deck_url as string | null) ??
      (initialDraft?.submission?.pitch_deck_url as string | null) ??
      null,
  );
  const [monthlyRevenueText, setMonthlyRevenueText] = useState(
    initialFormValues.monthlyRevenue?.length ? initialFormValues.monthlyRevenue.join(", ") : "",
  );
  const [quarterlyUsersText, setQuarterlyUsersText] = useState(
    initialFormValues.quarterlyUsers?.length ? initialFormValues.quarterlyUsers.join(", ") : "",
  );
  const upsertSnapshot = usePitchFormStore((state) => state.upsertSnapshot);
  const clearSnapshot = usePitchFormStore((state) => state.clearSnapshot);

  const {
    control,
    setValue,
    trigger,
    getValues,
    reset,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm<PitchFormInputValues>({
    resolver: zodResolver(pitchSchema),
    defaultValues: initialFormValues,
    mode: "onTouched",
  });

  const values = watch();
  const canPersist = isHydrated && Boolean(values.startupName?.trim());
  const currentStepKey = stepOrder[currentStep - 1]?.key;

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    let mounted = true;

    const applyRemoteDraft = (remote: NonNullable<PitchDraftData>) => {
      const startup = remote.startup as Record<string, unknown>;
      const mapped = mapStartupRowToPitchForm(startup, {
        founder: remote.founder,
        burnRate: remote.burnRate,
      });
      const resolvedStep = Math.max(
        1,
        Math.min(stepOrder.length, resolvePitchFormStep(remote.submission as Record<string, unknown>)),
      );
      const completed = resolvePitchStepsComplete(remote.submission as Record<string, unknown>);

      reset(mapped);
      setCurrentStep(resolvedStep);
      setStepsComplete(completed);
      syncDraftMedia(startup, remote.submission as Record<string, unknown>, {
        setLogoPreview,
        setCoverPreview,
        setPitchDeckRemoteUrl,
        setMonthlyRevenueText,
        setQuarterlyUsersText,
      }, mapped);

      try {
        localStorage.setItem(`${DRAFT_KEY}.${pitchId}`, JSON.stringify(stripFileFields(mapped)));
        localStorage.setItem(`${DRAFT_KEY}.${pitchId}.step`, String(resolvedStep));
      } catch {
        // ignore storage errors
      }
    };

    const bootstrap = async () => {
      try {
        if (initialDraft?.startup) {
          applyRemoteDraft(initialDraft);
          return;
        }

        const remote = await getPitchDraft(pitchId);
        if (!mounted) return;
        if (remote?.startup) {
          applyRemoteDraft(remote);
          return;
        }

        const raw = localStorage.getItem(`${DRAFT_KEY}.${pitchId}`);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<PitchFormInputValues>;
          reset({
            ...pitchFormEmptyDefaults,
            ...parsed,
            pitchDeck: null,
            startupLogo: null,
            coverImage: null,
          });
          if (Array.isArray(parsed.monthlyRevenue) && parsed.monthlyRevenue.length) {
            setMonthlyRevenueText(parsed.monthlyRevenue.join(", "));
          }
          if (Array.isArray(parsed.quarterlyUsers) && parsed.quarterlyUsers.length) {
            setQuarterlyUsersText(parsed.quarterlyUsers.join(", "));
          }
        }

        const localStep = Number(localStorage.getItem(`${DRAFT_KEY}.${pitchId}.step`) ?? "1");
        if (Number.isFinite(localStep)) {
          setCurrentStep(Math.max(1, Math.min(stepOrder.length, localStep)));
        }
      } catch (error) {
        console.error("Pitch form bootstrap failed", error);
        localStorage.removeItem(`${DRAFT_KEY}.${pitchId}`);
      } finally {
        if (mounted) setIsHydrated(true);
      }
    };

    void bootstrap();
    return () => {
      mounted = false;
    };
  }, [initialDraft, pitchId, reset]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(`${DRAFT_KEY}.${pitchId}.step`, String(currentStep));
    } catch {
      // ignore storage errors
    }
  }, [currentStep, isHydrated, pitchId]);

  useEffect(() => {
    if (!canPersist) return;
    const timer = setTimeout(() => {
      const snapshot = stripFileFields(getValues());
      try {
        localStorage.setItem(`${DRAFT_KEY}.${pitchId}`, JSON.stringify(snapshot));
      } catch {
        // ignore
      }
      upsertSnapshot({ pitchId, currentStep, values: snapshot, updatedAt: Date.now() });
    }, 300);
    return () => clearTimeout(timer);
  }, [canPersist, currentStep, getValues, pitchId, upsertSnapshot, values]);

  useEffect(() => {
    if (!canPersist) return;
    const timer = setTimeout(async () => {
      const snapshot = stripFileFields(getValues());
      setIsSavingDraft(true);
      try {
        await savePitchDraft({
          pitchId,
          currentStep,
          values: snapshot,
        });
        setAutosaveLabel("All changes saved");
      } catch (error) {
        console.error("Pitch autosave failed", error);
        setAutosaveLabel("Autosave failed");
      } finally {
        setIsSavingDraft(false);
      }
    }, 15000);
    return () => clearTimeout(timer);
  }, [canPersist, currentStep, getValues, pitchId, values]);

  useEffect(() => {
    if (!values.pitchDeck) return;
    const id = window.setInterval(() => {
      setUploadProgress((prev) => (prev >= 100 ? 100 : prev + 15));
    }, 120);

    return () => window.clearInterval(id);
  }, [values.pitchDeck]);

  const stepTitle = useMemo(() => {
    switch (currentStepKey) {
      case "basics":
        return { heading: "Step 1: Basic Startup Info", subheading: "Identity and profile that investors see first." };
      case "problem":
        return { heading: "Step 2: Problem & Solution", subheading: "What pain are you solving?" };
      case "financials":
        return { heading: "Step 3: Financials & Traction", subheading: "Revenue, burn, growth, and graph data." };
      case "deck":
        return { heading: "Step 4: Branding & Deck", subheading: "Upload your logo, cover image, and pitch deck." };
      case "founder":
        return { heading: "Step 5: Founder Details", subheading: "Team and founder background." };
      case "review":
        return { heading: "Step 6: Review & Submit", subheading: "Preview how investors will see your startup." };
      default:
        return { heading: "", subheading: "" };
    }
  }, [currentStepKey]);

  const progressPercent = Math.round((stepsComplete / stepOrder.length) * 100);

  const persistDraft = useCallback(async (): Promise<void> => {
    setIsSavingDraft(true);
    try {
      await savePitchDraft({
        pitchId,
        currentStep,
        values: stripFileFields(getValues()),
      });
      setAutosaveLabel("All changes saved");
    } catch (error) {
      setAutosaveLabel("Autosave failed");
      throw error;
    } finally {
      setIsSavingDraft(false);
    }
  }, [currentStep, getValues, pitchId]);

  const handleSaveDraftClick = async () => {
    const id = toast.loading("Saving draft...");
    try {
      await persistDraft();
      toast.update(id, {
        title: "Draft saved",
        description: "We'll keep autosaving as you type.",
        variant: "success",
      });
    } catch (error) {
      toast.update(id, {
        title: "Couldn't save draft",
        description: error instanceof Error ? error.message : "Please retry.",
        variant: "error",
      });
    }
  };

  const handleContinue = async () => {
    if (continueLoading) return;
    setContinueLoading(true);
    const fields = stepFieldMap[currentStepKey];
    const isValid = await trigger(fields);
    if (!isValid) {
      const firstError = fields
        .map((field) => errors[field as keyof typeof errors]?.message)
        .find(Boolean);
      toast.error({
        title: "Please complete required fields",
        description:
          typeof firstError === "string" ? firstError : "Some fields need your attention before continuing.",
      });
      setContinueLoading(false);
      return;
    }

    // Branding & Deck step: require either a freshly picked file OR an
    // existing remote deck URL so the founder isn't forced to re-upload.
    if (currentStepKey === "deck") {
      const currentValues = getValues();
      if (!(currentValues.pitchDeck instanceof File) && !pitchDeckRemoteUrl) {
        toast.error({
          title: "Pitch deck is required",
          description: "Upload a PDF or PPTX to continue.",
        });
        setContinueLoading(false);
        return;
      }
    }

    if (currentStep === stepOrder.length) {
      setContinueLoading(false);
      setConfirmOpen(true);
      return;
    }

    const id = toast.loading("Saving step...");
    try {
      await persistDraft();
      toast.update(id, {
        title: "Step saved successfully",
        description: `Moving to step ${currentStep + 1} of ${stepOrder.length}.`,
        variant: "success",
      });
      setStepsComplete((prev) => Math.max(prev, currentStep));
      setCurrentStep((step) => Math.min(step + 1, stepOrder.length));
      smoothScrollTop();
    } catch (error) {
      toast.update(id, {
        title: "Couldn't save this step",
        description: error instanceof Error ? error.message : "Please retry.",
        variant: "error",
      });
    } finally {
      setContinueLoading(false);
    }
  };

  const handleBack = () => {
    if (continueLoading) return;
    setCurrentStep((step) => Math.max(step - 1, 1));
    smoothScrollTop();
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const id = toast.loading("Submitting your pitch...");
    try {
      const validation = pitchSchema.safeParse(getValues());
      if (!validation.success) {
        const issue = validation.error.issues[0];
        toast.update(id, {
          title: "Pitch validation failed",
          description: issue?.message ?? "Please review every step.",
          variant: "error",
        });
        setIsSubmitting(false);
        setConfirmOpen(false);
        const fieldName = issue?.path?.[0];
        if (fieldName) {
          for (const [stepKey, fields] of Object.entries(stepFieldMap)) {
            if (fields.includes(fieldName as keyof PitchFormInputValues)) {
              const targetIndex = stepOrder.findIndex((step) => step.key === stepKey);
              if (targetIndex >= 0) setCurrentStep(targetIndex + 1);
              break;
            }
          }
        }
        return;
      }
      const payload = validation.data;
      if (!(payload.pitchDeck instanceof File) && !pitchDeckRemoteUrl) {
        toast.update(id, {
          title: "Pitch deck is required",
          description: "Upload your deck on the Branding & Deck step before submitting.",
          variant: "error",
        });
        setIsSubmitting(false);
        setConfirmOpen(false);
        const targetIndex = stepOrder.findIndex((step) => step.key === "deck");
        if (targetIndex >= 0) setCurrentStep(targetIndex + 1);
        return;
      }
      const fd = new FormData();
      fd.append("pitchId", pitchId);
      fd.append(
        "payload",
        JSON.stringify({
          ...payload,
          pitchDeck: undefined,
          startupLogo: undefined,
          coverImage: undefined,
        }),
      );
      if (payload.pitchDeck instanceof File) fd.append("deck", payload.pitchDeck);
      if (payload.startupLogo) fd.append("startupLogo", payload.startupLogo);
      if (payload.coverImage) fd.append("coverImage", payload.coverImage);
      await submitPitch(fd);
      localStorage.removeItem(`${DRAFT_KEY}.${pitchId}`);
      localStorage.removeItem(`${DRAFT_KEY}.${pitchId}.step`);
      clearSnapshot(pitchId);
      toast.update(id, {
        title: "Pitch submitted successfully",
        description: "Your startup is now under admin review.",
        variant: "success",
      });
      setConfirmOpen(false);
      setSuccessOpen(true);
    } catch (error) {
      console.error("Pitch submission failed", error);
      toast.update(id, {
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Please retry.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const reviewProps = {
    startupName: values.startupName ?? "",
    tagline: values.tagline ?? "",
    industry: values.industry ?? "SaaS",
    category: values.category ?? "",
    stage: values.stage ?? "Seed",
    location: values.location ?? "",
    description: values.solution ?? "",
    problem: values.problem ?? "",
    solution: values.solution ?? "",
    founderBio: values.founderBio ?? "",
    founderLinkedIn: values.founderLinkedIn ?? "",
    teamMembers: values.teamMembers ?? "",
    annualRevenue: Number(values.annualRevenue) || 0,
    fundingAsk: Number(values.askAmount) || 0,
    valuation: Number(values.valuation) || 0,
    equityOffered: Number(values.equityOffered) || 0,
    customers: Number(values.customers) || 0,
    burnRate: Number(values.burnRate) || 0,
    logoPreview,
    coverPreview,
    pitchDeckName: values.pitchDeck?.name ?? (pitchDeckRemoteUrl ? "Existing pitch deck" : null),
    pitchDeckUrl: pitchDeckRemoteUrl,
    monthlyRevenue: values.monthlyRevenue ?? [],
    quarterlyUsers: values.quarterlyUsers ?? [],
  } as const;

  return (
    <div className="mx-auto w-full max-w-[920px] space-y-6">
      <header className="space-y-1 text-center">
        <h1 className="text-3xl font-semibold text-slate-900 sm:text-[34px]">Founder Pitch Submission</h1>
        <p className="text-sm text-slate-500 sm:text-base">
          YC-style flow with autosave, validation, and secure upload.
        </p>
        <p className={cn("text-xs", isSavingDraft ? "text-[#387ED1]" : "text-slate-500")}>
          {isSavingDraft ? "Auto-saving..." : autosaveLabel}
        </p>
      </header>

      <PitchStepper steps={stepOrder} currentStep={currentStep} />

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{stepsComplete} of {stepOrder.length} steps complete</span>
          <span className="font-semibold text-slate-700">{progressPercent}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
          <motion.div
            className="h-full bg-linear-to-r from-[#387ED1] to-[#6da9ea]"
            initial={false}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </div>
      </div>

      <PitchFormCard>
        <div className="mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-2xl font-semibold text-slate-900">{stepTitle.heading}</h2>
          <p className="mt-1 text-sm text-slate-500">{stepTitle.subheading}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {currentStepKey === "basics" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="startupName" className="text-sm font-medium text-slate-700">
                    Startup Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="startupName"
                    value={values.startupName ?? ""}
                    onBlur={() => void trigger("startupName")}
                    onChange={(event) => setValue("startupName", event.target.value, { shouldValidate: false })}
                    placeholder="e.g. ScaleField"
                    className="h-11 rounded-xl border-slate-200 bg-slate-50"
                  />
                  {errors.startupName ? (
                    <p className="text-xs text-red-500">{errors.startupName.message}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <label htmlFor="tagline" className="text-sm font-medium text-slate-700">
                    Tagline <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="tagline"
                    value={values.tagline ?? ""}
                    onChange={(event) => setValue("tagline", event.target.value, { shouldDirty: true })}
                    placeholder="One-line startup pitch"
                    className="h-11 rounded-xl border-slate-200 bg-slate-50"
                  />
                  {errors.tagline ? <p className="text-xs text-red-500">{errors.tagline.message}</p> : null}
                </div>
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium text-slate-700">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="category"
                    value={values.category ?? ""}
                    onChange={(event) => setValue("category", event.target.value, { shouldDirty: true })}
                    placeholder="e.g. B2B SaaS"
                    className="h-11 rounded-xl border-slate-200 bg-slate-50"
                  />
                  {errors.category ? <p className="text-xs text-red-500">{errors.category.message}</p> : null}
                </div>
                <div className="space-y-2">
                  <label htmlFor="location" className="text-sm font-medium text-slate-700">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="location"
                    value={values.location ?? ""}
                    onChange={(event) => setValue("location", event.target.value, { shouldDirty: true })}
                    placeholder="City, Country"
                    className="h-11 rounded-xl border-slate-200 bg-slate-50"
                  />
                  {errors.location ? <p className="text-xs text-red-500">{errors.location.message}</p> : null}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Industry <span className="text-red-500">*</span></label>
                  <Select
                    value={values.industry ?? "SaaS"}
                    onValueChange={(value) =>
                      setValue("industry", value as PitchFormValues["industry"], { shouldValidate: true })
                    }
                  >
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industryOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.industry ? <p className="text-xs text-red-500">{errors.industry.message}</p> : null}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Stage <span className="text-red-500">*</span></label>
                  <Select
                    value={values.stage}
                    onValueChange={(value) => setValue("stage", value as PitchFormValues["stage"], { shouldValidate: true })}
                  >
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50">
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {stageOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Team Size</label>
                  <Input
                    type="number"
                    value={values.teamSize}
                    onChange={(event) => setValue("teamSize", Number(event.target.value), { shouldDirty: true })}
                    className="h-11 rounded-xl border-slate-200 bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Website</label>
                  <Input
                    value={values.website}
                    onChange={(event) => setValue("website", event.target.value, { shouldDirty: true })}
                    placeholder="https://yourstartup.com"
                    className="h-11 rounded-xl border-slate-200 bg-slate-50"
                  />
                </div>
              </div>
            ) : null}

            {currentStepKey === "problem" ? (
              <div className="space-y-5">
                <TextareaField id="problem" label="Problem Statement" placeholder="Describe the core problem..." value={values.problem} maxLength={500} error={errors.problem?.message} onChange={(value) => setValue("problem", value)} />
                <TextareaField id="solution" label="Solution" placeholder="How your startup solves it..." value={values.solution} maxLength={500} error={errors.solution?.message} onChange={(value) => setValue("solution", value)} />
                <TextareaField id="businessModel" label="Business Model" placeholder="How your startup makes money..." value={values.businessModel} maxLength={600} error={errors.businessModel?.message} onChange={(value) => setValue("businessModel", value)} />
                <TextareaField id="targetMarket" label="Target Market" placeholder="Who is your customer segment..." value={values.targetMarket} maxLength={600} error={errors.targetMarket?.message} onChange={(value) => setValue("targetMarket", value)} />
              </div>
            ) : null}

            {currentStepKey === "financials" ? (
              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <CurrencyInput id="annualRevenue" label="Revenue (Annual)" value={values.annualRevenue} error={errors.annualRevenue?.message} onChange={(value) => setValue("annualRevenue", value)} />
                  <CurrencyInput id="netProfit" label="Profit (Annual)" value={values.netProfit} error={errors.netProfit?.message} onChange={(value) => setValue("netProfit", value)} />
                  <CurrencyInput id="burnRate" label="Burn Rate (Monthly)" value={values.burnRate} error={errors.burnRate?.message} onChange={(value) => setValue("burnRate", value)} />
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Customers</label>
                    <Input type="number" value={values.customers} onChange={(event) => setValue("customers", Number(event.target.value), { shouldDirty: true })} className="h-11 rounded-xl border-slate-200 bg-slate-50" />
                  </div>
                  <CurrencyInput
                    id="askAmount"
                    label="Funding Ask (₹)"
                    value={values.askAmount ?? 0}
                    error={errors.askAmount?.message}
                    onBlur={() => void trigger("askAmount")}
                    onChange={(value) =>
                      setValue("askAmount", value, { shouldValidate: false, shouldDirty: true })
                    }
                  />
                  <CurrencyInput id="valuation" label="Valuation (₹)" value={values.valuation ?? 0} error={errors.valuation?.message} onChange={(value) => setValue("valuation", value)} />
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Equity Offered (%)</label>
                    <Input type="number" value={values.equityOffered} onChange={(event) => setValue("equityOffered", Number(event.target.value), { shouldDirty: true })} className="h-11 rounded-xl border-slate-200 bg-slate-50" />
                    {errors.equityOffered ? <p className="text-xs text-red-500">{errors.equityOffered.message}</p> : null}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">Graph data (optional but recommended)</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Investors love to see your trajectory. Enter comma or newline separated numbers
                    representing your latest months/quarters. We&apos;ll plot them on your public profile.
                  </p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Monthly revenue (₹)</label>
                      <textarea
                        value={monthlyRevenueText}
                        onChange={(event) => {
                          const text = event.target.value;
                          setMonthlyRevenueText(text);
                          const parsed = parseNumberList(text);
                          setValue("monthlyRevenue", parsed, { shouldDirty: true });
                        }}
                        placeholder="e.g. 250000, 320000, 410000, 480000, 520000, 600000"
                        className="min-h-[88px] w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none focus:border-[#387ED1] focus:ring-2 focus:ring-[#387ED1]/20"
                      />
                      <p className="text-[11px] text-slate-400">
                        {(values.monthlyRevenue ?? []).length} month{(values.monthlyRevenue ?? []).length === 1 ? "" : "s"} parsed
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Quarterly user growth</label>
                      <textarea
                        value={quarterlyUsersText}
                        onChange={(event) => {
                          const text = event.target.value;
                          setQuarterlyUsersText(text);
                          const parsed = parseNumberList(text);
                          setValue("quarterlyUsers", parsed, { shouldDirty: true });
                        }}
                        placeholder="e.g. 1200, 2400, 4800, 9000"
                        className="min-h-[88px] w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none focus:border-[#387ED1] focus:ring-2 focus:ring-[#387ED1]/20"
                      />
                      <p className="text-[11px] text-slate-400">
                        {(values.quarterlyUsers ?? []).length} quarter{(values.quarterlyUsers ?? []).length === 1 ? "" : "s"} parsed
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {currentStepKey === "deck" ? (
              <div className="space-y-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <ImageDropzone
                    label="Startup Logo"
                    aspect="square"
                    description="Square PNG works best"
                    file={values.startupLogo ?? null}
                    remoteUrl={values.startupLogo ? null : logoPreview}
                    required
                    maxSizeMb={3}
                    onFileSelect={(file) => {
                      setValue("startupLogo", file, { shouldDirty: true, shouldValidate: true });
                      setLogoPreview(file ? URL.createObjectURL(file) : null);
                    }}
                  />
                  <ImageDropzone
                    label="Cover Banner"
                    aspect="wide"
                    description="Wide hero image for your card"
                    file={values.coverImage ?? null}
                    remoteUrl={values.coverImage ? null : coverPreview}
                    required
                    onFileSelect={(file) => {
                      setValue("coverImage", file, { shouldDirty: true, shouldValidate: true });
                      setCoverPreview(file ? URL.createObjectURL(file) : null);
                    }}
                  />
                </div>
                <UploadDropzone
                  file={values.pitchDeck ?? null}
                  progress={uploadProgress}
                  error={errors.pitchDeck?.message}
                  onFileSelect={(file) => {
                    if (!file) {
                      setUploadProgress(0);
                      setValue("pitchDeck", null, { shouldValidate: true, shouldDirty: true });
                      return;
                    }

                    const checked = pitchDeckSchema.safeParse(file);
                    if (!checked.success) {
                      toast.error({
                        title: "Pitch deck rejected",
                        description: checked.error.issues[0]?.message ?? "Please use a valid file.",
                      });
                      setUploadProgress(0);
                      setValue("pitchDeck", null, { shouldValidate: true, shouldDirty: true });
                      return;
                    }
                    setUploadProgress(10);
                    clearErrors("pitchDeck");
                    setValue("pitchDeck", file, { shouldValidate: true, shouldDirty: true });
                  }}
                />
                {pitchDeckRemoteUrl && !values.pitchDeck ? (
                  <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                    <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />
                    A pitch deck is already on file. Upload a new one to replace it before re-submitting.
                  </p>
                ) : null}
              </div>
            ) : null}

            {currentStepKey === "founder" ? (
              <div className="space-y-5">
                <TextareaField id="founderBio" label="Founder Bio" placeholder="Background and credibility (min 50 chars)..." value={values.founderBio} maxLength={500} error={errors.founderBio?.message} onChange={(value) => setValue("founderBio", value)} />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">LinkedIn URL</label>
                  <Input value={values.founderLinkedIn} onChange={(event) => setValue("founderLinkedIn", event.target.value)} placeholder="https://linkedin.com/in/..." className="h-11 rounded-xl border-slate-200 bg-slate-50" />
                </div>
                <TextareaField id="founderExperience" label="Experience" placeholder="Prior startup, domain, exits..." value={values.founderExperience} maxLength={300} error={errors.founderExperience?.message} onChange={(value) => setValue("founderExperience", value)} />
                <TextareaField id="teamMembers" label="Team Members" placeholder="Name - role, one per line..." value={values.teamMembers} maxLength={500} error={errors.teamMembers?.message} onChange={(value) => setValue("teamMembers", value)} />
              </div>
            ) : null}

            {currentStepKey === "review" ? <ReviewPreview {...reviewProps} /> : null}

            <StepActions
              disableBack={currentStep === 1}
              loading={continueLoading}
              isFinal={currentStep === stepOrder.length}
              onBack={handleBack}
              onContinue={() => void handleContinue()}
            />
            <button
              type="button"
              onClick={() => void handleSaveDraftClick()}
              disabled={isSavingDraft}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              {isSavingDraft ? "Saving Draft..." : "Save Draft"}
            </button>
          </motion.div>
        </AnimatePresence>
      </PitchFormCard>

      <SubmitConfirmDialog
        open={confirmOpen}
        startupName={values.startupName ?? ""}
        loading={isSubmitting}
        onConfirm={() => void handleSubmit()}
        onClose={() => setConfirmOpen(false)}
      />
      <SubmitSuccessDialog
        open={successOpen}
        startupName={values.startupName ?? ""}
        onClose={() => {
          setSuccessOpen(false);
          router.push("/founder/dashboard");
          router.refresh();
        }}
        onCreateAnother={() => {
          setSuccessOpen(false);
          router.push("/founder/pitch-submission");
        }}
      />
    </div>
  );
}
