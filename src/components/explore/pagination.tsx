"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

type PaginationProps = {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ totalPages, currentPage, onPageChange }: PaginationProps) {
  const pages = getPageWindow(currentPage, totalPages);

  return (
    <nav className="flex items-center justify-center gap-1 pt-12" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 disabled:opacity-30",
        )}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {pages.map((p, i) =>
        p === "dots" ? (
          <span key={`d-${i}`} className="px-1 text-slate-400">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={cn(
              "min-w-[2.25rem] rounded-md px-3 py-2 text-sm font-medium transition",
              p === currentPage ? "bg-[#387ED1] text-white shadow-sm" : "text-slate-600 hover:bg-slate-100",
            )}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 disabled:opacity-30",
        )}
        aria-label="Next page"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </nav>
  );
}

function getPageWindow(current: number, total: number): Array<number | "dots"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const set = new Set<number>();
  set.add(1);
  set.add(total);
  for (let i = current - 1; i <= current + 1; i++) if (i > 1 && i < total) set.add(i);

  const sorted = [...set].sort((a, b) => a - b);
  const items: Array<number | "dots"> = [];
  for (let idx = 0; idx < sorted.length; idx++) {
    const p = sorted[idx];
    const prev = sorted[idx - 1];
    if (prev !== undefined && p > prev + 1) items.push("dots");
    items.push(p);
  }
  return items;
}
