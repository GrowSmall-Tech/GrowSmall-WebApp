import { SupabaseRealtimeRefresh } from "@/components/realtime/supabase-realtime-refresh";
import { getFeaturedStartups } from "@/lib/queries/startups";

import { LandingView } from "./landing-view";

export const dynamic = "force-dynamic";

export default async function Home() {
  const featuredStartups = await getFeaturedStartups();
  return (
    <>
      <SupabaseRealtimeRefresh />
      <LandingView featuredStartups={featuredStartups} />
    </>
  );
}
