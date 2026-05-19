import { CheckCircle2 } from "lucide-react";

export function PitchInfoCard() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <article className="relative overflow-hidden rounded-2xl bg-slate-100 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
        <div className="h-40 w-full bg-[linear-gradient(120deg,#0f172a,#334155_40%,#64748b)]" />
        <p className="absolute bottom-3 left-3 right-3 text-sm font-medium text-white">
          Join 5,000+ Indian founders who raised capital via GrowSmall.
        </p>
      </article>

      <article className="rounded-2xl border border-slate-100 bg-[#F8FAFF] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
        <h3 className="text-lg font-semibold text-slate-900">Why Pitch Here?</h3>
        <ul className="mt-3 space-y-2">
          {["Vetted Investor Network", "Average 48hr Response Time", "Encrypted Data Room"].map(
            (item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle2 className="h-4 w-4 text-[#387ED1]" />
                {item}
              </li>
            ),
          )}
        </ul>
      </article>
    </div>
  );
}
