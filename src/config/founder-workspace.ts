export type SubmissionStepState = "completed" | "active" | "pending";

export interface SubmissionStep {
  id: number;
  title: string;
  description: string;
  state: SubmissionStepState;
}

export interface FounderWorkspaceProfile {
  name: string;
  email: string;
  companyName: string;
  targetRange: string;
  roleLabel: string;
}

export const founderWorkspaceProfile: FounderWorkspaceProfile = {
  name: "Riya Sharma",
  email: "riya@growsmall.in",
  companyName: "GrowSmall",
  targetRange: "₹25L - ₹1.5Cr",
  roleLabel: "Founder",
};

export const founderSidebarLinks = [
  { href: "/founder/dashboard", label: "Dashboard", icon: "layout-dashboard" },
  {
    href: "/founder/pitch-submission",
    label: "Pitch Submission",
    icon: "rocket",
  },
  {
    href: "/founder/funding-history",
    label: "Funding History",
    icon: "landmark",
  },
  { href: "/founder/documents", label: "Documents", icon: "file-text" },
  { href: "/founder/settings", label: "Settings", icon: "settings" },
] as const;

export const founderTopNav = [
  { href: "/explore", label: "Explore" },
  { href: "/founder/pitch-submission", label: "Pitch" },
  { href: "/founder/activity", label: "Activity" },
] as const;

export const founderSubmissionSteps: SubmissionStep[] = [
  {
    id: 1,
    title: "Basic Company Details",
    description: "completed on 12 Oct",
    state: "completed",
  },
  {
    id: 2,
    title: "The Pitch Deck",
    description: "Currently building your deck.",
    state: "active",
  },
  {
    id: 3,
    title: "Financial Forecast",
    description: "Awaiting pitch deck",
    state: "pending",
  },
  {
    id: 4,
    title: "Market Traction",
    description: "Awaiting pitch deck",
    state: "pending",
  },
];

export const founderPitchWorkspaceContent = {
  title: "Raise Capital",
  subtitle:
    "Complete your pitch submission to get listed for high-net-worth investors and venture networks across India.",
  stepLabel: "Step 2 of 4",
  sectionTitle: "The Pitch Deck",
  autosaveLabel: "Auto-saving...",
  uploadTitle: "Upload Presentation (PDF/PPTX)",
  uploadHint: "Supported formats: PDF, Keynote, PPTX (Max 20MB)",
  summaryPlaceholder:
    "Briefly describe the problem you are solving and your unique value proposition...",
  summaryLimit: 280,
  videoTitle: "Record Live",
  videoDescription:
    "Investors love seeing the founder's passion. Record a 60-second clip right now or upload a video file.",
};

export const founderInsights = {
  title: "GrowAI Insights",
  message: "Startups with video pitches raise 42% more capital.",
};
