import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ActionFooterProps {
  isSaving: boolean;
}

export function ActionFooter({ isSaving }: ActionFooterProps) {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
      <Button type="button" variant="ghost" className="rounded-xl text-slate-600">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Previous Step
      </Button>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="ghost" className="rounded-xl text-[#387ED1]">
          {isSaving ? "Saving..." : "Save Draft"}
        </Button>
        <Button type="button" className="rounded-xl px-6">
          Continue to Financials
        </Button>
      </div>
    </div>
  );
}
