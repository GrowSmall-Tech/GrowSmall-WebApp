const shortDate = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/**
 * Human-readable date string that matches on server and client (avoids hydration errors
 * from `toLocaleDateString()` without an explicit locale).
 */
export function formatShortDate(iso: string | Date | number | null | undefined): string {
  if (iso == null || iso === "") return "—";
  const d = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return shortDate.format(d);
}
