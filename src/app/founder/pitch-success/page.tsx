import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function FounderPitchSuccessPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-2xl items-center justify-center">
      <div className="w-full rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="h-9 w-9 text-emerald-600" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold text-slate-900">Pitch Submitted Successfully</h1>
        <p className="mt-3 text-sm text-slate-600">
          Your startup has been submitted for admin review. Once approved, it will appear in the
          Explore section for investors.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild className="rounded-xl">
            <Link href="/founder/dashboard">View Dashboard</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/founder/pitch-submission">Submit Another Startup</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
