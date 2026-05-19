import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function StartupDetailsPageLegacy({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("startups").select("slug").eq("id", id).maybeSingle();
  if (!data?.slug) return notFound();
  redirect(`/startup/${data.slug}`);
}
