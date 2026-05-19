"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Bookmark, MapPin } from "lucide-react";

import type { ExploreListingStartup } from "@/types";
import { createClient } from "@/lib/supabase/client";

import { cn } from "@/lib/utils";

const COVER_FALLBACK = "/images/startup-placeholder.svg";
const LOGO_FALLBACK = "/images/logo-placeholder.svg";

export function StartupCard({ startup }: { startup: ExploreListingStartup }) {
  const router = useRouter();
  const [bookmarked, setBookmarked] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(`growsmall.bookmark.${startup.id}`) === "1";
  });
  const [isSavingBookmark, setIsSavingBookmark] = useState(false);
  const [coverSrc, setCoverSrc] = useState(startup.coverImage || COVER_FALLBACK);
  const [logoSrc, setLogoSrc] = useState(startup.logoImage || LOGO_FALLBACK);
  const href = `/startup/${startup.slug}`;

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("saved_startups")
        .select("id")
        .eq("investor_id", user.id)
        .eq("startup_id", startup.id)
        .maybeSingle();
      if (!ignore && data?.id) setBookmarked(true);
    };
    void run();
    return () => {
      ignore = true;
    };
  }, [startup.id]);

  const onBookmarkClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (isSavingBookmark) return;
    setIsSavingBookmark(true);
    const next = !bookmarked;
    setBookmarked(next);
    window.localStorage.setItem(`growsmall.bookmark.${startup.id}`, next ? "1" : "0");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      if (next) {
        await supabase.from("saved_startups").upsert(
          {
            investor_id: user.id,
            startup_id: startup.id,
          },
          { onConflict: "investor_id,startup_id" },
        );
      } else {
        await supabase
          .from("saved_startups")
          .delete()
          .eq("investor_id", user.id)
          .eq("startup_id", startup.id);
      }
    }
    setIsSavingBookmark(false);
  };

  return (
    <motion.article
      whileHover={{ y: -7, scale: 1.01 }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      onClick={() => router.push(href)}
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.08)] transition hover:shadow-[0_24px_70px_rgba(56,126,209,0.2)]"
    >
      <div className="relative h-40 w-full overflow-hidden bg-slate-100">
        <Image
          src={coverSrc}
          alt={startup.name}
          fill
          sizes="(max-width: 768px) 100vw, 480px"
          className="object-cover transition duration-300 group-hover:scale-105"
          onError={() => setCoverSrc(COVER_FALLBACK)}
          unoptimized={coverSrc === COVER_FALLBACK}
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-slate-950/55 to-transparent" />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-800">
            {startup.stage}
          </span>
          <span className="rounded-full bg-[#387ED1]/90 px-2.5 py-1 text-[11px] font-semibold text-white">
            {startup.industry}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Image
              src={logoSrc}
              alt={`${startup.name} logo`}
              width={42}
              height={42}
              className="rounded-xl border border-slate-200 bg-white object-cover"
              onError={() => setLogoSrc(LOGO_FALLBACK)}
              unoptimized={logoSrc === LOGO_FALLBACK}
            />
            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold tracking-tight text-slate-900">{startup.name}</h3>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                <MapPin className="h-3.5 w-3.5" />
                {startup.location}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onBookmarkClick}
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition",
              bookmarked
                ? "border-[#387ED1]/30 bg-[#387ED1]/10 text-[#387ED1]"
                : "border-slate-200 text-slate-500 hover:border-[#387ED1]/40 hover:text-[#387ED1]",
            )}
            aria-label="Bookmark startup"
            disabled={isSavingBookmark}
          >
            <Bookmark className={cn("h-4 w-4", bookmarked ? "fill-current" : "")} />
          </button>
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">{startup.description}</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-50 px-3 py-2.5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Funding ask</p>
            <p className="mt-1 text-sm font-semibold text-[#387ED1]">{startup.fundingAsk}</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2.5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Revenue</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{startup.revenue}</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>Raised progress</span>
            <span className="font-semibold text-slate-700">{startup.raisedPercent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full bg-linear-to-r from-[#387ED1] to-[#6da9ea]" style={{ width: `${startup.raisedPercent}%` }} />
          </div>
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            router.push(href);
          }}
          className="mt-5 flex w-full items-center justify-center gap-1 rounded-xl bg-slate-900 py-2.5 text-sm font-medium text-white transition hover:bg-[#387ED1]"
        >
          View Details
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </motion.article>
  );
}
