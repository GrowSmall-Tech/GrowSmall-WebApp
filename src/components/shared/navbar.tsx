import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

export type NavbarActiveNav = "home" | "explore" | "pitch" | "login" | undefined;

export function Navbar({ activeNav }: { activeNav?: NavbarActiveNav }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white">
      <div className="relative mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="z-10 text-lg font-semibold tracking-tight text-slate-900">
          GrowSmall
        </Link>

        <nav className="absolute left-1/2 top-1/2 hidden min-w-max -translate-x-1/2 -translate-y-1/2 items-center gap-8 text-sm md:flex">
          <NavTab href="/" active={activeNav === "home"}>
            Home
          </NavTab>
          <NavTab href="/explore" active={activeNav === "explore"}>
            Explore
          </NavTab>
          <NavTab href="/submit-pitch" active={activeNav === "pitch"}>
            Pitch
          </NavTab>
          <NavTab href="/auth/login" active={activeNav === "login"}>
            Login
          </NavTab>
        </nav>

        <div className="z-10 shrink-0">
          <Button size="sm" asChild className="rounded-lg px-4">
            <Link href="/auth/select-role">Get Started</Link>
          </Button>
        </div>
      </div>

      <div className="border-t border-slate-50 md:hidden">
        <nav className="mx-auto flex max-w-6xl items-center justify-center gap-8 px-4 py-2.5 text-sm">
          <NavTab href="/" active={activeNav === "home"}>
            Home
          </NavTab>
          <NavTab href="/explore" active={activeNav === "explore"}>
            Explore
          </NavTab>
          <NavTab href="/submit-pitch" active={activeNav === "pitch"}>
            Pitch
          </NavTab>
          <NavTab href="/auth/login" active={activeNav === "login"}>
            Login
          </NavTab>
        </nav>
      </div>
    </header>
  );
}

function NavTab({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative pb-0.5 font-medium transition-colors",
        active ? "text-[#387ED1]" : "text-slate-600 hover:text-slate-900",
      )}
    >
      {children}
      <span
        className={cn(
          "absolute bottom-[-2px] left-0 right-0 h-[2px] rounded-full transition-opacity bg-[#387ED1]",
          active ? "opacity-100" : "opacity-0",
        )}
        aria-hidden
      />
    </Link>
  );
}
