import type { Faq, Stat } from "@/types";

export const landingStats: Stat[] = [
  { label: "Total Funding", value: "120M+" },
  { label: "Active Startups", value: "500+" },
  { label: "Global Investors", value: "2,500+" },
];

export const landingFaqs: Faq[] = [
  {
    question: "How does GrowSmall vet startups?",
    answer:
      "Each listing goes through document checks, traction verification, and admin review before appearing publicly.",
  },
  {
    question: "Who can invest?",
    answer:
      "Accredited investors and syndicates invited through the platform can participate once compliance checks complete.",
  },
  {
    question: "How quickly do listing updates appear?",
    answer:
      "Approved changes sync across the marketing site, Explore, and dashboards in real time via Supabase.",
  },
];
