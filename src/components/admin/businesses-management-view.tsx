"use client";

import { useState } from "react";

import { StartupFormModal } from "@/components/admin/startup-form-modal";
import { StartupTable } from "@/components/admin/startup-table";
import { Button } from "@/components/ui/button";
import type { StartupWithPitch, UserRow } from "@/types/database";

export function BusinessesManagementView({
  startups,
  founders,
}: {
  startups: StartupWithPitch[];
  founders: UserRow[];
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<StartupWithPitch | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Businesses
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Create, edit, and feature startups across the platform.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          Add Startup
        </Button>
      </div>

      <StartupTable
        startups={startups}
        allowDelete
        onEdit={(row) => {
          setEditing(row);
          setOpen(true);
        }}
      />

      <StartupFormModal
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setEditing(null);
        }}
        founders={founders}
        editing={editing}
      />
    </div>
  );
}
