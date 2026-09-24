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

  async function run(action: string) {
    setBusy(action);
    setError(null);
    try {
      const response = await fetch(`/api/admin/inquiries/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Action failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {status === "PENDING_JD" && (
        <>
          <button
            onClick={() => run("jd_approved")}
            disabled={!!busy}
            className="bg-green-700 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
          >
            JD approved → Send payment
          </button>
          <button
            onClick={() => run("decline")}
            disabled={!!busy}
            className="bg-red-700 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
          >
            Decline
          </button>
        </>
      )}
      {status === "AWAITING_PAYMENT" && (
        <button
          onClick={() => run("mark_paid")}
          disabled={!!busy}
          className="bg-blue-700 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
        >
          Mark paid
        </button>
      )}
      {status === "PAID" && (
        <button
          onClick={() => run("mark_booked")}
          disabled={!!busy}
          className="bg-ranch-dark text-white px-3 py-1 rounded text-xs disabled:opacity-50"
        >
          Confirm booking
        </button>
      )}
      {error && <span className="text-xs text-red-700">{error}</span>}
    </div>
  );
}
