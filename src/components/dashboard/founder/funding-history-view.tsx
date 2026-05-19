"use client";

import { useState, useTransition } from "react";

import { addFundingRound } from "@/lib/actions/founder";
import { formatShortDate } from "@/lib/format/date";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FundingRow = {
  id: string;
  amount: number;
  investor_name: string;
  round_type: string;
  created_at: string;
};

export function FundingHistoryView({
  startupId,
  rounds,
}: {
  startupId: string | null;
  rounds: FundingRow[];
}) {
  const [amount, setAmount] = useState("");
  const [investorName, setInvestorName] = useState("");
  const [roundType, setRoundType] = useState("Seed");
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const totalRaised = rounds.reduce((sum, r) => sum + Number(r.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Add funding round</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" />
          <Input value={investorName} onChange={(e) => setInvestorName(e.target.value)} placeholder="Investor name" />
          <Input value={roundType} onChange={(e) => setRoundType(e.target.value)} placeholder="Round type" />
        </div>
        <Button
          className="mt-3"
          disabled={!startupId || isPending}
          onClick={() =>
            startTransition(async () => {
              if (!startupId) return;
              await addFundingRound({
                startupId,
                amount: Number(amount) || 0,
                investorName,
                roundType,
              });
              setStatus("Funding round saved");
            })
          }
        >
          Save round
        </Button>
        {status ? <p className="mt-2 text-xs text-slate-500">{status}</p> : null}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-500">Total raised</p>
        <p className="text-2xl font-semibold text-slate-900">₹{totalRaised.toLocaleString("en-IN")}</p>
      </div>

      {rounds.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          No funding rounds yet. Start by adding your first investor commitment.
        </div>
      ) : (
        <div className="space-y-3">
          {rounds.map((round) => (
            <div key={round.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-slate-900">{round.round_type}</p>
                <p className="text-sm text-slate-500">{formatShortDate(round.created_at)}</p>
              </div>
              <p className="mt-1 text-sm text-slate-600">{round.investor_name}</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">₹{Number(round.amount).toLocaleString("en-IN")}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
