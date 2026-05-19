import { InvestorPageShell } from "@/components/dashboard/investor/investor-page-shell";
import { SupabaseRealtimeRefresh } from "@/components/realtime/supabase-realtime-refresh";
import { uploadInvestorDocument } from "@/lib/actions/investor";
import { getInvestorDocuments, getInvestorNotifications } from "@/lib/queries/investor";

export const dynamic = "force-dynamic";

export default async function InvestorDocumentsPage() {
  const [documents, notifications] = await Promise.all([
    getInvestorDocuments(),
    getInvestorNotifications(),
  ]);
  return (
    <>
      <SupabaseRealtimeRefresh tables={["documents", "notifications"]} />
      <InvestorPageShell notifications={notifications}>
        <h1 className="text-2xl font-semibold text-slate-900">Documents</h1>
        <p className="mt-1 text-sm text-slate-600">Upload, categorize, and manage files.</p>
        <form action={uploadInvestorDocument} className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-slate-100 bg-white p-4">
          <select name="category" className="h-10 rounded-lg border border-slate-200 px-3 text-sm">
            <option value="pitch_deck">Pitch Decks</option>
            <option value="legal">Legal</option>
            <option value="due_diligence">Due Diligence</option>
          </select>
          <input name="file" type="file" accept=".pdf,.doc,.docx" className="text-sm" required />
          <button type="submit" className="h-10 rounded-lg bg-[#387ED1] px-4 text-sm font-semibold text-white">
            Upload
          </button>
        </form>
        <div className="mt-6 rounded-xl border border-slate-100 bg-white p-4">
          {documents.length === 0 ? (
            <p className="text-sm text-slate-500">No documents uploaded yet.</p>
          ) : (
            <ul className="space-y-2">
              {documents.map((doc) => (
                <li key={doc.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm">
                  <span>{doc.title}</span>
                  <span className="text-slate-500">{doc.category}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </InvestorPageShell>
    </>
  );
}
