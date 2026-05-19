import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-max py-10 space-y-6">
      <Skeleton className="h-44 w-full rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
      </div>
    </div>
  );
}
