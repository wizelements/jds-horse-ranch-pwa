"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface InquiryActionsProps {
  id: string;
  status: string;
  automationPaused: boolean;
  rescheduleRequestText: string | null;
  customerServiceWindowExpiresAt: string | null;
}

export default function InquiryActions({
  id,
  status,
  automationPaused,
  rescheduleRequestText,
  customerServiceWindowExpiresAt,
}: InquiryActionsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [approvedStartAt, setApprovedStartAt] = useState("");
  const [note, setNote] = useState("");
  const [humanMessage, setHumanMessage] = useState("");

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
      if (action === "send_message") setHumanMessage("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(null);
    }
  }

  function parseFutureDate() {
    if (!approvedStartAt) {
      setError("Enter the JD-approved ride date and time.");
      return null;
    }
    const parsed = new Date(approvedStartAt);
    if (Number.isNaN(parsed.getTime()) || parsed.getTime() <= Date.now()) {
      setError("Enter a valid future ride date and time.");
      return null;
    }
    return parsed;
  }

  function approve() {
    const amountCents = Math.round(Number(amount) * 100);
    if (!amount || !Number.isFinite(amountCents) || amountCents < 100) {
      setError("Enter the JD-approved price.");
      return;
    }
    const parsed = parseFutureDate();
    if (!parsed) return;

    void run("jd_approved", {
      amountCents,
      approvedStartAt: parsed.toISOString(),
      note,
    });
  }

  function approveChange() {
    const parsed = parseFutureDate();
    if (!parsed) return;
    void run("approve_change", {
      approvedStartAt: parsed.toISOString(),
      note,
    });
  }

  const serviceWindowOpen =
    customerServiceWindowExpiresAt !== null &&
    new Date(customerServiceWindowExpiresAt).getTime() > Date.now();

  return (
    <div className="min-w-[270px] space-y-3">
      {automationPaused && (
        <div className="rounded border border-blue-200 bg-blue-50 p-3">
          <p className="mb-2 text-xs font-semibold text-blue-900">
            Customer requested JD. Automation is paused.
          </p>
          {serviceWindowOpen ? (
            <>
              <textarea
                value={humanMessage}
                onChange={(event) => setHumanMessage(event.target.value)}
                placeholder="Reply to the customer in WhatsApp"
                rows={3}
                className="w-full rounded border px-2 py-1 text-sm"
              />
              <button
                onClick={() => run("send_message", { message: humanMessage })}
                disabled={!!busy || !humanMessage.trim()}
                className="mt-2 rounded bg-blue-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
              >
                Send WhatsApp reply
              </button>
            </>
          ) : (
            <p className="text-xs text-blue-800">
              The free-form 24-hour WhatsApp reply window is closed. Use an
              approved operational template for the next business-initiated message.
            </p>
          )}
          <button
            onClick={() => run("resume_automation")}
            disabled={!!busy}
            className="mt-2 block rounded border border-blue-700 px-3 py-2 text-xs font-semibold text-blue-800 disabled:opacity-50"
          >
            Resume assistant
          </button>
        </div>
      )}

      {status === "PENDING_JD" && (
        <div className="space-y-2">
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
                placeholder="85.00"
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
        </div>
      )}

      {rescheduleRequestText &&
        ["AWAITING_PAYMENT", "BOOKED"].includes(status) && (
          <div className="rounded border border-amber-200 bg-amber-50 p-3">
            <p className="mb-2 text-xs font-semibold text-amber-900">
              Customer change request
            </p>
            <p className="mb-3 whitespace-pre-wrap text-xs text-amber-900">
              {rescheduleRequestText}
            </p>
            <label className="text-xs text-gray-700">
              New approved date/time
              <input
                type="datetime-local"
                value={approvedStartAt}
                onChange={(event) => setApprovedStartAt(event.target.value)}
                className="mt-1 w-full rounded border px-2 py-1 text-sm"
              />
            </label>
            <label className="mt-2 block text-xs text-gray-700">
              JD note
              <input
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Optional"
                className="mt-1 w-full rounded border px-2 py-1 text-sm"
              />
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                onClick={approveChange}
                disabled={!!busy}
                className="rounded bg-green-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
              >
                Approve change
              </button>
              <button
                onClick={() => run("decline_change", { note })}
                disabled={!!busy}
                className="rounded bg-red-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
              >
                Keep existing booking
              </button>
            </div>
          </div>
        )}

      {status === "AWAITING_PAYMENT" && (
        <p className="text-xs text-amber-700">
          Waiting for verified Square payment.
        </p>
      )}

      {status === "BOOKED" && (
        <button
          onClick={() => run("complete")}
          disabled={!!busy}
          className="rounded bg-ranch-dark px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
        >
          Mark ride complete
        </button>
      )}

      {!["PENDING_JD", "AWAITING_PAYMENT", "BOOKED"].includes(status) &&
        !automationPaused && (
          <span className="text-xs text-gray-500">No action required</span>
        )}

      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
