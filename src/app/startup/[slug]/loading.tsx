import { Skeleton } from "@/components/ui/skeleton";

export default function StartupProfileLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="hidden h-9 w-40 md:block" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>
      <div className="mx-auto max-w-6xl space-y-12 px-4 py-10 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            <Skeleton className="h-14 w-14 rounded-xl" />
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-24 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-7 w-24 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-72 rounded-2xl" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}
