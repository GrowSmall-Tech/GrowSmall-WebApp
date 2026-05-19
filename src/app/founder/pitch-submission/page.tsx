import { redirect } from "next/navigation";

import { createPitchDraft } from "@/lib/actions/pitch";

export const dynamic = "force-dynamic";

export default async function FounderPitchSubmissionPage() {
  const draft = await createPitchDraft();
  redirect(`/founder/pitch-submission/${draft.pitchId}`);
}
