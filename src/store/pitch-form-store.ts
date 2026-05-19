"use client";

import { create } from "zustand";

import type { PitchFormInputValues } from "@/lib/validation/pitch-schema";

type PitchDraftSnapshot = {
  pitchId: string;
  currentStep: number;
  values: Partial<PitchFormInputValues>;
  updatedAt: number;
};

type PitchFormStore = {
  byPitchId: Record<string, PitchDraftSnapshot>;
  upsertSnapshot: (snapshot: PitchDraftSnapshot) => void;
  clearSnapshot: (pitchId: string) => void;
};

export const usePitchFormStore = create<PitchFormStore>((set) => ({
  byPitchId: {},
  upsertSnapshot: (snapshot) =>
    set((state) => ({
      byPitchId: {
        ...state.byPitchId,
        [snapshot.pitchId]: snapshot,
      },
    })),
  clearSnapshot: (pitchId) =>
    set((state) => {
      const next = { ...state.byPitchId };
      delete next[pitchId];
      return { byPitchId: next };
    }),
}));
