"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  MoreHorizontal,
  Star,
  TrendingUp,
} from "lucide-react";

import { StatusBadge } from "@/components/admin/status-badge";

const ADMIN_LOGO_FALLBACK = "/images/logo-placeholder.svg";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  deleteStartupAction,
  toggleFeaturedAction,
  toggleTrendingAction,
  updateStartupStatusAction,
} from "@/lib/admin/actions";
import { formatShortDate } from "@/lib/format/date";
import { useAdminStore } from "@/store/admin-store";
import type { StartupStatus, StartupWithPitch } from "@/types/database";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;

type SortKey = "name" | "industry" | "submitted" | "status";
type SortDir = "asc" | "desc";

function SortHeaderIcon({
  column,
  activeColumn,
  direction,
}: {
  column: SortKey;
  activeColumn: SortKey;
  direction: SortDir;
}) {
  if (activeColumn !== column) {
    return <ArrowUpDown className="ml-1 inline h-3.5 w-3.5 text-slate-400" />;
  }
  return direction === "asc" ? (
    <ArrowUp className="ml-1 inline h-3.5 w-3.5 text-[#387ED1]" />
  ) : (
    <ArrowDown className="ml-1 inline h-3.5 w-3.5 text-[#387ED1]" />
  );
}

function latestSubmissionIso(row: StartupWithPitch): string {
  const pitches = row.pitch_submissions ?? [];
  if (!pitches.length) return row.created_at;
  const sorted = [...pitches].sort(
    (a, b) =>
      new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime(),
  );
  return sorted[0]?.submitted_at ?? row.created_at;
}

export function StartupTable({
  startups,
  className,
  allowDelete,
  onEdit,
}: {
  startups: StartupWithPitch[];
  className?: string;
  allowDelete?: boolean;
  onEdit?: (row: StartupWithPitch) => void;
}) {
  const search = useAdminStore((s) => s.startupSearch);
  const setSearch = useAdminStore((s) => s.setStartupSearch);
  const statusFilter = useAdminStore((s) => s.startupStatusFilter);
  const setStatusFilter = useAdminStore((s) => s.setStartupStatusFilter);

  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>("submitted");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return startups.filter((s) => {
      const statusOk =
        statusFilter === "all" ? true : s.status === statusFilter;
      const textOk =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.industry.toLowerCase().includes(q);
      return statusOk && textOk;
    });
  }, [startups, search, statusFilter]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") {
        cmp = a.name.localeCompare(b.name);
      } else if (sortKey === "industry") {
        cmp = a.industry.localeCompare(b.industry);
      } else if (sortKey === "status") {
        cmp = a.status.localeCompare(b.status);
      } else {
        cmp =
          new Date(latestSubmissionIso(a)).getTime() -
          new Date(latestSubmissionIso(b)).getTime();
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const slice = sorted.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "submitted" ? "desc" : "asc");
    }
  }

  function runAction(fn: () => Promise<void>) {
    setError(null);
    startTransition(() => {
      void fn().catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Action failed");
      });
    });
  }

  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white shadow-sm", className)}>
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-slate-900">Startup Management</h2>
          <Filter className="h-4 w-4 text-slate-400" aria-hidden />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="h-9 max-w-xs rounded-lg border-slate-200 text-sm"
          />
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as StartupStatus | "all");
              setPage(0);
            }}
          >
            <SelectTrigger className="h-9 w-[140px] rounded-lg">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending_review">Pending review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <MoreHorizontal className="h-4 w-4 text-slate-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSearch("")}>Clear search</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {error ? (
        <p className="border-b border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[64px]">Logo</TableHead>
            <TableHead>
              <button
                type="button"
                className="inline-flex items-center font-medium text-slate-500"
                onClick={() => toggleSort("name")}
              >
                Name
                <SortHeaderIcon column="name" activeColumn={sortKey} direction={sortDir} />
              </button>
            </TableHead>
            <TableHead>
              <button
                type="button"
                className="inline-flex items-center font-medium text-slate-500"
                onClick={() => toggleSort("industry")}
              >
                Industry
                <SortHeaderIcon column="industry" activeColumn={sortKey} direction={sortDir} />
              </button>
            </TableHead>
            <TableHead>
              <button
                type="button"
                className="inline-flex items-center font-medium text-slate-500"
                onClick={() => toggleSort("submitted")}
              >
                Submission Date
                <SortHeaderIcon column="submitted" activeColumn={sortKey} direction={sortDir} />
              </button>
            </TableHead>
            <TableHead>
              <button
                type="button"
                className="inline-flex items-center font-medium text-slate-500"
                onClick={() => toggleSort("status")}
              >
                Status
                <SortHeaderIcon column="status" activeColumn={sortKey} direction={sortDir} />
              </button>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {slice.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-slate-500">
                No startups match your filters.
              </TableCell>
            </TableRow>
          ) : (
            slice.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <div className="relative h-9 w-9 overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <Image
                      src={row.logo_url ?? ADMIN_LOGO_FALLBACK}
                      alt={`${row.name} logo`}
                      fill
                      sizes="36px"
                      className="object-cover"
                      unoptimized={!row.logo_url}
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium text-slate-900">{row.name}</TableCell>
                <TableCell className="text-slate-600">{row.industry}</TableCell>
                <TableCell className="text-slate-600">
                  {formatShortDate(latestSubmissionIso(row))}
                </TableCell>
                <TableCell>
                  <StatusBadge status={row.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {row.status !== "live" ? (
                      <button
                        type="button"
                        disabled={pending}
                        className="text-xs font-medium text-[#387ED1] hover:underline disabled:opacity-50"
                        onClick={() =>
                          runAction(() => updateStartupStatusAction(row.id, "live"))
                        }
                      >
                        Go live
                      </button>
                    ) : null}
                    {row.status !== "rejected" ? (
                      <button
                        type="button"
                        disabled={pending}
                        className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                        onClick={() => {
                          const reason =
                            typeof window !== "undefined"
                              ? window.prompt("Add rejection reason for founder (optional):", "")
                              : "";
                          runAction(() =>
                            updateStartupStatusAction(row.id, "rejected", reason ?? ""),
                          );
                        }}
                      >
                        Reject
                      </button>
                    ) : null}
                    <button
                      type="button"
                      disabled={pending}
                      className="text-xs font-medium text-slate-500 hover:text-slate-800 disabled:opacity-50"
                      onClick={() =>
                        runAction(() => updateStartupStatusAction(row.id, "pending_review"))
                      }
                    >
                      Move to review
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      className="inline-flex items-center justify-center rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-[#387ED1] disabled:opacity-50"
                      aria-label={row.is_featured ? "Unfeature" : "Feature"}
                      onClick={() =>
                        runAction(() =>
                          toggleFeaturedAction(row.id, !row.is_featured),
                        )
                      }
                    >
                      <Star
                        className={cn(
                          "h-4 w-4",
                          row.is_featured && "fill-[#387ED1] text-[#387ED1]",
                        )}
                      />
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      className="inline-flex items-center justify-center rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-emerald-600 disabled:opacity-50"
                      aria-label={row.is_trending ? "Remove trending" : "Trending"}
                      onClick={() =>
                        runAction(() =>
                          toggleTrendingAction(row.id, !row.is_trending),
                        )
                      }
                    >
                      <TrendingUp
                        className={cn(
                          "h-4 w-4",
                          row.is_trending && "text-emerald-600",
                        )}
                      />
                    </button>
                    {onEdit ? (
                      <button
                        type="button"
                        disabled={pending}
                        className="text-xs font-medium text-slate-600 hover:text-slate-900 disabled:opacity-50"
                        onClick={() => onEdit(row)}
                      >
                        Edit
                      </button>
                    ) : null}
                    {allowDelete ? (
                      <button
                        type="button"
                        disabled={pending}
                        className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                        onClick={() => {
                          if (
                            typeof window !== "undefined" &&
                            !window.confirm(`Delete ${row.name}?`)
                          ) {
                            return;
                          }
                          runAction(() => deleteStartupAction(row.id));
                        }}
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
        <span>
          {sorted.length === 0 ? (
            <>Showing 0 of 0 startups</>
          ) : (
            <>
              Showing {safePage * PAGE_SIZE + 1}–
              {Math.min((safePage + 1) * PAGE_SIZE, sorted.length)} of {sorted.length} startups
            </>
          )}
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={safePage <= 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={safePage >= pageCount - 1}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {pending ? (
        <p className="border-t border-slate-100 px-4 py-2 text-xs text-slate-400">Updating…</p>
      ) : null}
    </div>
  );
}
