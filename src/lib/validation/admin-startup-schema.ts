import { z } from "zod";

export const startupFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .optional()
    .refine(
      (s) => !s || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s),
      "Use lowercase letters, numbers, and hyphens",
    ),
  industry: z.string().min(1, "Industry is required"),
  description: z.string().optional(),
  funding_ask: z.number().nonnegative().optional(),
  annual_revenue: z.number().nonnegative().optional(),
  valuation: z.number().nonnegative().optional(),
  stage: z.string().optional().nullable(),
  founder_id: z.string().optional(),
});

export type StartupFormValues = z.infer<typeof startupFormSchema>;

/** Maps empty number inputs to undefined for react-hook-form */
export function emptyToUndefinedNumber(value: unknown): number | undefined {
  if (value === "" || value === null || value === undefined) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}
