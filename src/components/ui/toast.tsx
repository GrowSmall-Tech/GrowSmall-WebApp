"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, Loader2, X } from "lucide-react";

import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "info" | "loading";

export type ToastPayload = {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
  durationMs?: number;
};

type ToastListener = (toasts: ToastPayload[]) => void;

class ToastQueue {
  private toasts: ToastPayload[] = [];
  private listeners = new Set<ToastListener>();
  private nextId = 1;

  subscribe(listener: ToastListener) {
    this.listeners.add(listener);
    listener(this.toasts);
    return () => {
      this.listeners.delete(listener);
    };
  }

  push(input: Omit<ToastPayload, "id">) {
    const id = this.nextId++;
    const next: ToastPayload = { id, ...input };
    this.toasts = [...this.toasts, next];
    this.emit();
    const ttl = input.variant === "loading" ? null : input.durationMs ?? 3500;
    if (ttl !== null) {
      setTimeout(() => this.remove(id), ttl);
    }
    return id;
  }

  update(id: number, patch: Partial<Omit<ToastPayload, "id">>) {
    this.toasts = this.toasts.map((t) => (t.id === id ? { ...t, ...patch } : t));
    this.emit();
    if (patch.variant && patch.variant !== "loading") {
      setTimeout(() => this.remove(id), patch.durationMs ?? 3500);
    }
  }

  remove(id: number) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.emit();
  }

  private emit() {
    for (const listener of this.listeners) listener(this.toasts);
  }
}

const queue = new ToastQueue();

type ToastInput = string | { title: string; description?: string; durationMs?: number };

function normalise(input: ToastInput): { title: string; description?: string; durationMs?: number } {
  return typeof input === "string" ? { title: input } : input;
}

export const toast = {
  success(input: ToastInput) {
    return queue.push({ ...normalise(input), variant: "success" });
  },
  error(input: ToastInput) {
    return queue.push({ ...normalise(input), variant: "error" });
  },
  info(input: ToastInput) {
    return queue.push({ ...normalise(input), variant: "info" });
  },
  loading(input: ToastInput) {
    return queue.push({ ...normalise(input), variant: "loading" });
  },
  update(id: number, patch: Partial<Omit<ToastPayload, "id">>) {
    queue.update(id, patch);
  },
  dismiss(id: number) {
    queue.remove(id);
  },
};

const variantStyles: Record<ToastVariant, { bg: string; ring: string; icon: React.ComponentType<{ className?: string }>; iconColor: string }> = {
  success: {
    bg: "bg-white",
    ring: "ring-emerald-100",
    icon: CheckCircle2,
    iconColor: "text-emerald-500",
  },
  error: {
    bg: "bg-white",
    ring: "ring-red-100",
    icon: AlertCircle,
    iconColor: "text-red-500",
  },
  info: {
    bg: "bg-white",
    ring: "ring-slate-100",
    icon: Info,
    iconColor: "text-[#387ED1]",
  },
  loading: {
    bg: "bg-white",
    ring: "ring-slate-100",
    icon: Loader2,
    iconColor: "text-[#387ED1] animate-spin",
  },
};

export function Toaster() {
  const [toasts, setToasts] = React.useState<ToastPayload[]>([]);

  React.useEffect(() => {
    return queue.subscribe(setToasts);
  }, []);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-5 right-5 z-100 flex w-[min(calc(100vw-2.5rem),360px)] flex-col gap-2"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const styles = variantStyles[t.variant];
          const Icon = styles.icon;
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-2xl px-4 py-3 shadow-[0_18px_50px_rgba(15,23,42,0.18)] ring-1",
                styles.bg,
                styles.ring,
              )}
            >
              <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", styles.iconColor)} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">{t.title}</p>
                {t.description ? (
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{t.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => queue.remove(t.id)}
                className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
