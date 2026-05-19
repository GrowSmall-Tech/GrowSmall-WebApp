"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";

function LinkedInGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

import { FadeInSection } from "@/components/startup-profile/fade-in";
import type { StartupProfile } from "@/types/startup-profile";

export function FounderCard({ founder }: { founder: StartupProfile["founder"] }) {
  return (
    <FadeInSection>
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.22 }}
        className="flex flex-col gap-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.07)] sm:flex-row sm:items-start sm:gap-10 sm:p-8"
      >
        <div className="relative mx-auto h-40 w-40 shrink-0 overflow-hidden rounded-2xl bg-slate-100 sm:mx-0 sm:h-44 sm:w-44">
          <Image
            src={founder.imageSrc}
            alt={founder.name}
            fill
            sizes="(max-width: 640px) 160px, 176px"
            className="object-cover"
            priority={false}
          />
        </div>
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <h3 className="text-xl font-semibold tracking-tight text-slate-900">{founder.name}</h3>
          <p className="mt-1 text-sm font-medium text-[#387ED1]">{founder.role}</p>
          <p className="mt-4 text-sm italic leading-relaxed text-slate-600">“{founder.quote}”</p>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">{founder.bio}</p>
          <div className="mt-6 flex items-center justify-center gap-4 sm:justify-start">
            <Link
              href={founder.linkedIn}
              className="text-slate-400 transition hover:text-[#387ED1]"
              aria-label={`${founder.name} on LinkedIn`}
            >
              <LinkedInGlyph className="h-5 w-5" />
            </Link>
            <Link
              href={founder.email}
              className="text-slate-400 transition hover:text-[#387ED1]"
              aria-label={`Email ${founder.name}`}
            >
              <Mail className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </motion.div>
    </FadeInSection>
  );
}
