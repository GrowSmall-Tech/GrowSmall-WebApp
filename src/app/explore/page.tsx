import { ExploreContent } from "@/components/explore/explore-content";
import { FloatingSubmitButton } from "@/components/explore/floating-submit-button";
import { SiteFooter } from "@/components/explore/footer";
import { SupabaseRealtimeRefresh } from "@/components/realtime/supabase-realtime-refresh";
import { Navbar } from "@/components/shared/navbar";
import {
  countApprovedStartups,
  getApprovedStartups,
  getFeaturedStartups,
} from "@/lib/queries/startups";

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  const [featuredStartups, listings, catalogTotal] = await Promise.all([
    getFeaturedStartups(6),
    getApprovedStartups({ limit: 500 }),
    countApprovedStartups(),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SupabaseRealtimeRefresh />
      <Navbar activeNav="explore" />
      <ExploreContent
        featuredStartups={featuredStartups}
        listings={listings}
        catalogTotal={catalogTotal}
      />
      <SiteFooter />
      <FloatingSubmitButton />
    </div>
  );
}
