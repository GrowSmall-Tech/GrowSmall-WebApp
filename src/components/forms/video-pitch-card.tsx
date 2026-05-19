import { PlayCircle, Upload, Video } from "lucide-react";

import { Button } from "@/components/ui/button";

export function VideoPitchCard() {
  return (
    <section>
      <p className="mb-3 text-sm font-medium text-slate-800">Elevator Pitch Video</p>
      <div className="grid gap-4 rounded-xl bg-slate-50/70 p-3 md:grid-cols-[220px_minmax(0,1fr)] md:items-center">
        <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-[linear-gradient(135deg,#185ca6,#38a1d1)] p-4 text-white">
          <div className="space-y-1">
            <p className="text-xs text-white/80">Founder Intro Clip</p>
            <p className="text-sm font-medium">60-second investor introduction</p>
          </div>
          <div className="mt-6 flex justify-center">
            <PlayCircle className="h-10 w-10" />
          </div>
        </div>
        <div>
          <h3 className="text-[28px] leading-none font-semibold text-slate-900">Record Live</h3>
          <p className="mt-2 max-w-md text-sm text-slate-600">
            Investors love seeing the founder&apos;s passion. Record a 60-second clip right now or
            upload a video file.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button type="button" className="rounded-xl">
              <Video className="mr-2 h-4 w-4" />
              Record
            </Button>
            <Button type="button" variant="outline" className="rounded-xl">
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
