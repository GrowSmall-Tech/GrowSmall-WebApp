import { InvestorPageShell } from "@/components/dashboard/investor/investor-page-shell";
import { SupabaseRealtimeRefresh } from "@/components/realtime/supabase-realtime-refresh";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateInvestorProfile } from "@/lib/actions/investor";
import { getInvestorNotifications, getInvestorProfile } from "@/lib/queries/investor";

export const dynamic = "force-dynamic";

export default async function InvestorSettingsPage() {
  const [profile, notifications] = await Promise.all([
    getInvestorProfile(),
    getInvestorNotifications(),
  ]);
  return (
    <>
      <SupabaseRealtimeRefresh tables={["investor_profiles", "notifications"]} />
      <InvestorPageShell notifications={notifications}>
        <div className="space-y-6">
          <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
          <p className="text-sm text-slate-600">Profile, preferences, and KYC status.</p>
          <form action={updateInvestorProfile} className="grid gap-4 rounded-xl border border-slate-100 bg-white p-6 shadow-sm md:grid-cols-2">
            <Input name="phone" placeholder="Phone" defaultValue={profile?.phone ?? ""} />
            <Input name="focus_sectors" placeholder="Focus sectors (comma separated)" defaultValue={profile?.focus_sectors?.join(", ") ?? ""} />
            <Input name="cheque_size_min" placeholder="Min cheque size" defaultValue={String(profile?.cheque_size_min ?? "")} />
            <Input name="cheque_size_max" placeholder="Max cheque size" defaultValue={String(profile?.cheque_size_max ?? "")} />
            <Input name="bio" placeholder="Investor bio" defaultValue={profile?.bio ?? ""} className="md:col-span-2" />
            <div className="md:col-span-2">
              <p className="text-sm text-slate-500">KYC: {profile?.kyc_status ?? "pending"}</p>
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Save settings</Button>
            </div>
          </form>
        </div>
      </InvestorPageShell>
    </>
  );
}
