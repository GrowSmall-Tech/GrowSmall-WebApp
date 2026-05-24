import type { SupabaseClient } from "@supabase/supabase-js";

const MEDIA_BUCKETS = ["startup-logos", "startup-covers", "pitch-decks"] as const;

export function storagePathFromPublicUrl(
  url: string | null | undefined,
  bucket: string,
): string | null {
  if (!url?.trim()) return null;
  try {
    const pathname = new URL(url).pathname;
    const marker = `/object/public/${bucket}/`;
    const idx = pathname.indexOf(marker);
    if (idx === -1) return null;
    return decodeURIComponent(pathname.slice(idx + marker.length));
  } catch {
    return null;
  }
}

export async function purgeStartupMediaStorage(
  supabase: SupabaseClient,
  startupId: string,
  urlHints: Array<string | null | undefined>,
): Promise<void> {
  const pathsByBucket = new Map<string, Set<string>>();
  for (const bucket of MEDIA_BUCKETS) {
    pathsByBucket.set(bucket, new Set());
  }

  for (const bucket of MEDIA_BUCKETS) {
    const paths = pathsByBucket.get(bucket)!;
    for (const url of urlHints) {
      const path = storagePathFromPublicUrl(url, bucket);
      if (path) paths.add(path);
    }

    const { data: listed } = await supabase.storage.from(bucket).list(startupId, {
      limit: 200,
    });
    for (const file of listed ?? []) {
      if (file.name) paths.add(`${startupId}/${file.name}`);
    }
  }

  await Promise.all(
    MEDIA_BUCKETS.map(async (bucket) => {
      const paths = [...(pathsByBucket.get(bucket) ?? [])];
      if (!paths.length) return;
      const { error } = await supabase.storage.from(bucket).remove(paths);
      if (error) {
        console.warn(`[admin] failed to remove ${bucket} objects:`, error.message);
      }
    }),
  );
}
