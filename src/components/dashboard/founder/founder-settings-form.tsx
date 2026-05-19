"use client";

import { useState, useTransition } from "react";

import { updateFounderSettings } from "@/lib/actions/founder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function FounderSettingsForm({
  defaults,
}: {
  defaults: {
    founderName: string;
    bio: string;
    linkedin: string;
    startupName: string;
    tagline: string;
  };
}) {
  const [form, setForm] = useState({ ...defaults, notificationsEmail: true });
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-xl font-semibold text-slate-900">Founder settings</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input value={form.founderName} onChange={(e) => setForm({ ...form, founderName: e.target.value })} placeholder="Founder name" />
        <Input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} placeholder="LinkedIn URL" />
        <Input value={form.startupName} onChange={(e) => setForm({ ...form, startupName: e.target.value })} placeholder="Startup name" />
        <Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="Tagline" />
      </div>
      <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Founder bio" />
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={form.notificationsEmail}
          onChange={(e) => setForm({ ...form, notificationsEmail: e.target.checked })}
        />
        Email notifications
      </label>
      <Button
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            try {
              await updateFounderSettings(form);
              setStatus("Settings updated");
            } catch (error) {
              setStatus(error instanceof Error ? error.message : "Failed");
            }
          })
        }
      >
        Save settings
      </Button>
      {status ? <p className="text-xs text-slate-500">{status}</p> : null}
    </div>
  );
}
