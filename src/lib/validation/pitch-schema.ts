import { z } from "zod";

export const industryOptions = [
  "Fintech",
  "SaaS",
  "AI/ML",
  "AgriTech",
  "HealthTech",
  "Cybersecurity",
] as const;

export const stageOptions = ["Pre-Seed", "Seed", "Series A", "Series B+"] as const;

const MAX_DECK_SIZE = 20 * 1024 * 1024;
const allowedDeckTypes = [
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

export const pitchSchema = z.object({
  startupName: z
    .string()
    .trim()
    .min(2, "Startup name must be at least 2 characters.")
    .max(80, "Startup name must be under 80 characters."),
  tagline: z
    .string()
    .trim()
    .min(10, "Tagline must be at least 10 characters.")
    .max(140, "Tagline must be under 140 characters."),
  category: z
    .string()
    .trim()
    .min(2, "Category is required.")
    .max(60, "Category must be under 60 characters."),
  location: z
    .string()
    .trim()
    .min(2, "Location is required.")
    .max(120, "Location must be under 120 characters."),
  industry: z.enum(industryOptions, {
    error: "Please select your startup industry.",
  }),
  stage: z.enum(stageOptions, {
    error: "Please select a startup stage.",
  }),
  website: z
    .string()
    .trim()
    .url("Enter a valid website URL.")
    .or(z.literal("")),
  teamSize: z
    .number({ error: "Enter team size." })
    .min(1, "Team size must be at least 1.")
    .max(5000, "Team size seems too high."),
  problem: z
    .string()
    .trim()
    .min(30, "Problem statement must be at least 30 characters.")
    .max(500, "Problem statement must be under 500 characters."),
  solution: z
    .string()
    .trim()
    .min(30, "Solution must be at least 30 characters.")
    .max(500, "Solution must be under 500 characters."),
  businessModel: z
    .string()
    .trim()
    .min(20, "Business model must be at least 20 characters.")
    .max(600, "Business model must be under 600 characters."),
  targetMarket: z
    .string()
    .trim()
    .min(20, "Target market must be at least 20 characters.")
    .max(600, "Target market must be under 600 characters."),
  annualRevenue: z
    .number({ error: "Enter annual revenue." })
    .min(0, "Annual revenue cannot be negative.")
    .max(1_000_000_000_000, "Annual revenue value is too high."),
  netProfit: z
    .number({ error: "Enter net profit." })
    .min(-1_000_000_000_000, "Net profit value is too low.")
    .max(1_000_000_000_000, "Net profit value is too high."),
  burnRate: z
    .number({ error: "Enter monthly burn rate." })
    .min(0, "Burn rate cannot be negative.")
    .max(1_000_000_000_000, "Burn rate value is too high."),
  customers: z
    .number({ error: "Enter customer count." })
    .min(0, "Customers cannot be negative.")
    .max(100_000_000, "Customer count is too high."),
  askAmount: z
    .number({ error: "Enter your funding ask." })
    .positive("Funding ask must be greater than zero.")
    .max(1_000_000_000_000, "Funding ask value is too high."),
  valuation: z
    .number({ error: "Enter valuation." })
    .min(0, "Valuation cannot be negative.")
    .max(1_000_000_000_000, "Valuation value is too high."),
  equityOffered: z
    .number({ error: "Enter equity offered." })
    .min(0, "Equity offered cannot be negative.")
    .max(100, "Equity offered cannot exceed 100."),
  // Pitch deck may be null when an existing deck is already on file in DB.
  // The server route enforces "either a new File OR an existing pitch_deck_url".
  pitchDeck: z
    .custom<File | null>((value) => value === null || value instanceof File, {
      message: "Please upload a valid deck file.",
    })
    .superRefine((file, ctx) => {
      if (!file) return;
      if (!allowedDeckTypes.includes(file.type)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Only PDF or PPTX files are supported.",
        });
      }
      if (file.size > MAX_DECK_SIZE) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "File size must be less than 20MB.",
        });
      }
    }),
  startupLogo: z.custom<File | null>((value) => value === null || value instanceof File, {
    message: "Please upload a valid startup logo file.",
  }),
  coverImage: z.custom<File | null>((value) => value === null || value instanceof File, {
    message: "Please upload a valid cover image file.",
  }),
  monthlyRevenue: z
    .array(z.number().min(0, "Revenue must be ≥ 0"))
    .max(24, "Up to 24 months only.")
    .default([]),
  quarterlyUsers: z
    .array(z.number().min(0, "Users must be ≥ 0"))
    .max(12, "Up to 12 quarters only.")
    .default([]),
  founderBio: z
    .string()
    .trim()
    .min(50, "Founder bio must be at least 50 characters.")
    .max(500, "Founder bio must be under 500 characters."),
  founderLinkedIn: z
    .string()
    .trim()
    .url("Enter a valid LinkedIn URL.")
    .or(z.literal("")),
  founderExperience: z
    .string()
    .trim()
    .min(10, "Experience must be at least 10 characters.")
    .max(300, "Experience must be under 300 characters."),
  teamMembers: z
    .string()
    .trim()
    .min(2, "Add at least one team member.")
    .max(500, "Team members text is too long."),
});

export const pitchDeckSchema = z
  .custom<File | null>((value) => value === null || value instanceof File, {
    message: "Please upload a valid deck file.",
  })
  .superRefine((file, ctx) => {
    if (!file) return;

    if (!allowedDeckTypes.includes(file.type)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Only PDF or PPTX files are supported.",
      });
    }

    if (file.size > MAX_DECK_SIZE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "File size must be less than 20MB.",
      });
    }
  });

export type PitchFormValues = z.output<typeof pitchSchema>;
export type PitchFormInputValues = z.input<typeof pitchSchema>;
