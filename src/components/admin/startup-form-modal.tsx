"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createStartupAction,
  updateStartupAction,
} from "@/lib/admin/actions";
import {
  emptyToUndefinedNumber,
  startupFormSchema,
  type StartupFormValues,
} from "@/lib/validation/admin-startup-schema";
import type { StartupWithPitch, UserRow } from "@/types/database";

function slugify(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function StartupFormModal({
  open,
  onOpenChange,
  founders,
  editing,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  founders: UserRow[];
  editing?: StartupWithPitch | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<StartupFormValues>({
    resolver: zodResolver(startupFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      industry: "",
      description: "",
      funding_ask: undefined,
      annual_revenue: undefined,
      valuation: undefined,
      stage: "",
      founder_id: "",
    },
  });

  const founderId = useWatch({ control: form.control, name: "founder_id" });

  useEffect(() => {
    if (!editing) {
      form.reset({
        name: "",
        slug: "",
        industry: "",
        description: "",
        funding_ask: undefined,
        annual_revenue: undefined,
        valuation: undefined,
        stage: "",
        founder_id: "",
      });
      return;
    }
    form.reset({
      name: editing.name,
      slug: editing.slug,
      industry: editing.industry,
      description: editing.description ?? "",
      funding_ask: editing.funding_ask ?? undefined,
      annual_revenue: editing.annual_revenue ?? undefined,
      valuation: editing.valuation ?? undefined,
      stage: editing.stage ?? "",
      founder_id: editing.founder_id ?? "",
    });
  }, [editing, form]);

  function onSubmit(values: StartupFormValues) {
    startTransition(() => {
      const slug = values.slug?.trim() || slugify(values.name);
      const payload = {
        name: values.name,
        slug,
        industry: values.industry,
        description: values.description,
        funding_ask: values.funding_ask ?? null,
        annual_revenue: values.annual_revenue ?? null,
        valuation: values.valuation ?? null,
        stage: values.stage || null,
        founder_id: values.founder_id?.length ? values.founder_id : null,
      };

      const promise = editing
        ? updateStartupAction(editing.id, payload)
        : createStartupAction(payload);

      void promise
        .then(() => {
          router.refresh();
          onOpenChange(false);
          form.reset();
        })
        .catch((e: unknown) => {
          form.setError("root", {
            message: e instanceof Error ? e.message : "Could not save startup",
          });
        });
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Startup" : "Add Startup"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {form.formState.errors.root ? (
            <p className="text-sm text-red-600">{form.formState.errors.root.message}</p>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="name">Startup Name</Label>
            <Input
              id="name"
              {...form.register("name")}
              onBlur={(e) => {
                if (!editing) {
                  const slug = form.getValues("slug");
                  if (!slug) {
                    form.setValue("slug", slugify(e.target.value));
                  }
                }
              }}
            />
            {form.formState.errors.name ? (
              <p className="text-xs text-red-600">{form.formState.errors.name.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" {...form.register("slug")} placeholder="my-startup" />
            {form.formState.errors.slug ? (
              <p className="text-xs text-red-600">{form.formState.errors.slug.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input id="industry" {...form.register("industry")} />
            {form.formState.errors.industry ? (
              <p className="text-xs text-red-600">{form.formState.errors.industry.message}</p>
            ) : null}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="funding_ask">Funding Ask (₹)</Label>
              <Input
                id="funding_ask"
                type="number"
                step="1"
                {...form.register("funding_ask", {
                  setValueAs: emptyToUndefinedNumber,
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="annual_revenue">Annual revenue (₹)</Label>
              <Input
                id="annual_revenue"
                type="number"
                step="1"
                {...form.register("annual_revenue", {
                  setValueAs: emptyToUndefinedNumber,
                })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="valuation">Valuation (₹)</Label>
              <Input
                id="valuation"
                type="number"
                step="1"
                {...form.register("valuation", {
                  setValueAs: emptyToUndefinedNumber,
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stage">Stage</Label>
              <Input id="stage" {...form.register("stage")} placeholder="Seed" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Founder</Label>
            <Select
              value={founderId ? founderId : "none"}
              onValueChange={(v) =>
                form.setValue("founder_id", v === "none" ? "" : v, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select founder (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {founders.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.full_name} — {f.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...form.register("description")} />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : editing ? "Save changes" : "Save startup"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
