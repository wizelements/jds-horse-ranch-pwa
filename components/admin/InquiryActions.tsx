"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InquiryActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [approvedStartAt, setApprovedStartAt] = useState("");
  const [note, setNote] = useState("");

  async function run(action: string, extra: Record<string, unknown> = {}) {
    setBusy(action);
    setError(null);
    try {
      const response = await fetch(`/api/admin/inquiries/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Action failed");
      if (result.warning) setError(result.warning);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(null);
    }
  }

  function approve() {
    const amountCents = Math.round(Number(amount) * 100);
    if (!amount || !Number.isFinite(amountCents) || amountCents < 100) {
      setError("Enter the JD-approved price.");
      return;
    }
    if (!approvedStartAt) {
      setError("Enter the JD-approved ride date and time.");
      return;
    }
    const parsed = new Date(approvedStartAt);
    if (Number.isNaN(parsed.getTime())) {
      setError("Enter a valid ride date and time.");
      return;
    }
    void run("jd_approved", {
      amountCents,
      approvedStartAt: parsed.toISOString(),
      note,
    });
  }

  if (status === "PENDING_JD") {
    return (
      <div className="min-w-[250px] space-y-2">
        <div className="grid grid-cols-1 gap-2">
          <label className="text-xs text-gray-600">
            Approved date/time
            <input
              type="datetime-local"
              value={approvedStartAt}
              onChange={(event) => setApprovedStartAt(event.target.value)}
              className="mt-1 w-full rounded border px-2 py-1 text-sm"
            />
          </label>
          <label className="text-xs text-gray-600">
            Approved total ($)
            <input
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="75.00"
              className="mt-1 w-full rounded border px-2 py-1 text-sm"
            />
          </label>
          <label className="text-xs text-gray-600">
            JD note / adjustment
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional"
              className="mt-1 w-full rounded border px-2 py-1 text-sm"
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={approve}
            disabled={!!busy}
            className="rounded bg-green-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            Approve + create Square payment
          </button>
          <button
            onClick={() => run("decline", { reason: note })}
            disabled={!!busy}
            className="rounded bg-red-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            Decline
          </button>
        </div>
        {error && <p className="text-xs text-red-700">{error}</p>}
      </div>
    );
  }

  if (status === "AWAITING_PAYMENT") {
    return <p className="text-xs text-amber-700">Waiting for verified Square payment.</p>;
  }

  if (status === "BOOKED") {
    return (
      <div>
        <button
          onClick={() => run("complete")}
          disabled={!!busy}
          className="rounded bg-ranch-dark px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
        >
          Mark ride complete
        </button>
        {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
      </div>
    );
  }

  return <span className="text-xs text-gray-500">No action required</span>;
}
