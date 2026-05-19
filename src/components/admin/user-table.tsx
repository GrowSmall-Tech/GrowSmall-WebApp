"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Trash2, UserX } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { deleteUserAction, setUserSuspendedAction } from "@/lib/admin/actions";
import { formatShortDate } from "@/lib/format/date";
import { useAdminStore } from "@/store/admin-store";
import type { UserRow } from "@/types/database";
import { cn } from "@/lib/utils";

export function UserTable({ users }: { users: UserRow[] }) {
  const roleFilter = useAdminStore((s) => s.userRoleFilter);
  const setRoleFilter = useAdminStore((s) => s.setUserRoleFilter);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (roleFilter === "all") return users;
    return users.filter((u) => u.role === roleFilter);
  }, [users, roleFilter]);

  function run(fn: () => Promise<void>) {
    setError(null);
    startTransition(() => {
      void fn().catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Action failed");
      });
    });
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-slate-900">Users</h2>
        <Select
          value={roleFilter}
          onValueChange={(v) => setRoleFilter(v as typeof roleFilter)}
        >
          <SelectTrigger className="h-9 w-[160px] rounded-lg">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="founder">Founders</SelectItem>
            <SelectItem value="investor">Investors</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {error ? (
        <p className="border-b border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      ) : null}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((u) => (
            <TableRow key={u.id}>
              <TableCell className="font-medium text-slate-900">{u.full_name}</TableCell>
              <TableCell className="text-slate-600">{u.email}</TableCell>
              <TableCell className="capitalize text-slate-600">{u.role}</TableCell>
              <TableCell className="text-slate-600">
                {formatShortDate(u.created_at)}
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium",
                    u.suspended
                      ? "bg-red-100 text-red-800"
                      : "bg-emerald-100 text-emerald-800",
                  )}
                >
                  {u.suspended ? "Suspended" : "Active"}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex flex-wrap justify-end gap-2">
                  <Button variant="outline" size="sm" className="h-8" asChild>
                    <Link
                      href={
                        u.role === "investor"
                          ? "/investor/dashboard"
                          : u.role === "founder"
                            ? "/founder/dashboard"
                            : "/"
                      }
                    >
                      Profile
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1"
                    disabled={pending}
                    onClick={() =>
                      run(() => setUserSuspendedAction(u.id, !u.suspended))
                    }
                  >
                    <UserX className="h-3.5 w-3.5" />
                    {u.suspended ? "Unsuspend" : "Suspend"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                    disabled={pending}
                    onClick={() => {
                      if (
                        typeof window !== "undefined" &&
                        !window.confirm(`Delete user ${u.email}?`)
                      ) {
                        return;
                      }
                      run(() => deleteUserAction(u.id));
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
