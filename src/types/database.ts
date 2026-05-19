export type StartupStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "live";
export type PitchSubmissionStatus = "pending" | "approved" | "rejected";
export type PlatformRole = "founder" | "investor" | "admin";

export type StartupRow = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  industry: string;
  location: string | null;
  description: string | null;
  problem: string | null;
  solution: string | null;
  funding_ask: number | null;
  valuation: number | null;
  equity_offered: number | null;
  annual_revenue: number | null;
  annual_profit: number | null;
  growth_rate: number | null;
  stage: string | null;
  category: string | null;
  logo_url: string | null;
  banner_url: string | null;
  cover_image_url?: string | null;
  pitch_deck_url?: string | null;
  founder_id: string | null;
  is_featured: boolean;
  is_trending: boolean;
  views_count?: number | null;
  investor_interest_count?: number | null;
  rejection_reason?: string | null;
  revenue_graph?: Array<number | { month?: string; value: number }> | null;
  user_growth_graph?: Array<number | { period?: string; value: number }> | null;
  status: StartupStatus;
  created_at: string;
};

export type Startup = StartupRow;

export type UserRow = {
  id: string;
  role: PlatformRole;
  full_name: string;
  email: string;
  avatar_url: string | null;
  headline: string | null;
  bio: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  startup_id: string | null;
  suspended: boolean;
  created_at: string;
};

export type Founder = UserRow;
export type FounderRow = UserRow;

export type PitchSubmissionRow = {
  id: string;
  startup_id: string;
  pitch_deck_url: string | null;
  executive_summary: string | null;
  video_pitch_url: string | null;
  status: PitchSubmissionStatus;
  submitted_at: string;
};

export type StartupMetricRow = {
  id: string;
  startup_id: string;
  month: string;
  revenue: number | null;
  users_growth: number | null;
  created_at: string;
};

export type StartupMetric = StartupMetricRow;

export type MarketSizeRow = {
  id: string;
  startup_id: string;
  tam: number;
  sam: number;
  som: number;
  created_at: string;
};

export type MarketSize = MarketSizeRow;

export type InvestmentRow = {
  id: string;
  investor_id: string;
  startup_id: string;
  amount: number;
  equity_percent: number | null;
  roi_percent: number | null;
  status: "active" | "exited" | "watching";
  invested_at: string;
  created_at: string;
};

export type SavedStartupRow = {
  id: string;
  investor_id: string;
  startup_id: string;
  created_at: string;
};

export type NotificationRow = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: "startup" | "pitch" | "investment" | "milestone" | "system";
  link: string | null;
  is_read: boolean;
  created_at: string;
};

export type InvestorProfileRow = {
  user_id: string;
  bio: string | null;
  avatar_url: string | null;
  phone: string | null;
  focus_sectors: string[] | null;
  cheque_size_min: number | null;
  cheque_size_max: number | null;
  email_updates: boolean;
  push_updates: boolean;
  kyc_status: "pending" | "submitted" | "verified";
  updated_at: string;
};

export type DocumentRow = {
  id: string;
  investor_id: string;
  startup_id: string | null;
  title: string;
  category: "pitch_deck" | "legal" | "due_diligence";
  file_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
};

export type InvitationRow = {
  id: string;
  inviter_id: string;
  invitee_email: string;
  message: string | null;
  status: "pending" | "accepted" | "expired";
  created_at: string;
};

export type ActivityRow = {
  id: string;
  investor_id: string;
  startup_id: string | null;
  action:
    | "viewed_startup"
    | "saved_startup"
    | "unsaved_startup"
    | "investment_added"
    | "profile_updated"
    | "document_uploaded";
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type PitchSubmissionLite = Pick<
  PitchSubmissionRow,
  "id" | "status" | "submitted_at"
> & {
  submission_status?: string | null;
  current_step?: number | null;
};

export type StartupWithPitch = StartupRow & {
  pitch_submissions?: PitchSubmissionLite[] | null;
};
