import { PitchForm } from "@/components/pitch/PitchForm";
import { getPitchDraft } from "@/lib/actions/pitch";

export const dynamic = "force-dynamic";

export default async function FounderPitchSubmissionByIdPage({
  params,
}: {
  params: Promise<{ pitchId: string }>;
}) {
  const { pitchId } = await params;
  const initialDraft = await getPitchDraft(pitchId);
  return <PitchForm key={pitchId} pitchId={pitchId} initialDraft={initialDraft} />;
}
