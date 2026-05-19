export default function FounderMessagesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Messages</h1>
      <p className="text-sm text-slate-600">
        Investor threads, NDAs, and calendar holds will appear here via realtime channels.
      </p>
      <div className="rounded-xl border border-slate-100 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
        Inbox preview coming soon — hook Supabase Realtime (`messages` topics).
      </div>
    </div>
  );
}
