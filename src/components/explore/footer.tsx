import Link from "next/link";

/** Full-width footer for marketing + explore flows. */
export function SiteFooter() {
  return (
    <footer className="border-t border-slate-100 bg-slate-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <p className="text-lg font-semibold text-slate-900">GrowSmall</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Transparent startup discovery and investing for serious builders and capital partners.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-slate-600">
          {["About", "Terms", "Privacy", "Support", "Contact"].map((label) => (
            <Link key={label} href="#" className="transition hover:text-[#387ED1]">
              {label}
            </Link>
          ))}
        </nav>
        <p className="text-sm text-slate-500 md:text-right">
          © {new Date().getFullYear()} GrowSmall. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

/** Alias matching design doc naming (`Footer`). */
export const Footer = SiteFooter;
