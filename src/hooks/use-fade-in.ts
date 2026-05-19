"use client";

import { useMemo } from "react";

export function useFadeIn(delay = 0) {
  return useMemo(
    () => ({
      initial: { opacity: 0, y: 20 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, amount: 0.25 },
      transition: { duration: 0.5, delay },
    }),
    [delay]
  );
}
