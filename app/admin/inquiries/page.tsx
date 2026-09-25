import InquiryActions from "@/components/admin/InquiryActions";
import { BookingInquiry, listInquiries } from "@/lib/bookingStore";

function money(cents: number | null) {
  return cents ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100) : "—";
}

export default async function InquiriesPage() {
  let inquiries: BookingInquiry[] = [];
  let error: string | null = null;

  try {
    inquiries = await listInquiries(100);
  } catch (err) {
    console.error(err);
    error =
      "Could not load reservation inquiries. Verify the Turso environment variables and run the current Turso migration.";
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Reservation Queue</h1>
      <p className="text-gray-600 mb-6">
        One queue for web, WhatsApp, and SMS. JD must personally approve the final time and amount before a Square payment request is created.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-3">Request</th>
              <th className="text-left p-3">Customer</th>
              <th className="text-left p-3">Riders</th>
              <th className="text-left p-3">Timing</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Payment</th>
              <th className="text-left p-3">JD action</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((item) => (
              <tr key={item.id} className="border-b align-top">
                <td className="p-3 min-w-[170px]">
                  <div className="font-medium">{item.service_requested || "Service not set"}</div>
                  <div className="text-xs text-gray-500">{item.channel} · {new Date(item.created_at).toLocaleString()}</div>
                  <div className="mt-2 text-xs text-gray-600">{item.experience || ""}</div>
                  {item.qualification_notes && (
                    <div className="mt-1 text-xs text-gray-600">Notes: {item.qualification_notes}</div>
                  )}
                  {item.reschedule_request_text && (
                    <div className="mt-2 rounded bg-amber-50 p-2 text-xs text-amber-900">
                      Change requested: {item.reschedule_request_text}
                    </div>
                  )}
                  {item.automation_paused && (
                    <div className="mt-2 rounded bg-blue-50 p-2 text-xs font-semibold text-blue-900">
                      Human follow-up requested
                    </div>
                  )}
                </td>
                <td className="p-3 min-w-[160px]">
                  <div className="font-medium">{item.customer_name || "—"}</div>
                  <div className="text-gray-500">{item.customer_phone}</div>
                  <div className="text-gray-500 break-all">{item.email || ""}</div>
                </td>
                <td className="p-3 min-w-[180px]">
                  <div className="font-medium">{item.rider_count || "—"} rider(s)</div>
                  <div className="text-xs text-gray-500 whitespace-pre-wrap">{item.rider_details || ""}</div>
                </td>
                <td className="p-3 min-w-[190px]">
                  <div><span className="font-medium">Requested:</span> {item.requested_datetime_text || "—"}</div>
                  <div className="mt-1 text-xs text-gray-500">Alternate: {item.alternate_datetime_text || "—"}</div>
                  {item.approved_start_at && (
                    <div className="mt-2 text-xs font-semibold text-green-800">
                      Approved: {new Date(item.approved_start_at).toLocaleString()}
                    </div>
                  )}
                  {item.hold_expires_at && item.status === "PENDING_JD" && (
                    <div className="mt-2 text-xs text-amber-700">
                      Hold ends: {new Date(item.hold_expires_at).toLocaleString()}
                    </div>
                  )}
                </td>
                <td className="p-3 font-semibold">{item.status}</td>
                <td className="p-3 min-w-[150px]">
                  <div>{money(item.approved_amount_cents)}</div>
                  {item.square_payment_url && (
                    <a
                      href={item.square_payment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-ranch-brown underline"
                    >
                      Open Square checkout
                    </a>
                  )}
                  {item.paid_at && <div className="text-xs text-green-700 mt-1">Verified paid</div>}
                </td>
                <td className="p-3">
                  <InquiryActions
                    id={item.id}
                    status={item.status}
                    automationPaused={item.automation_paused}
                    rescheduleRequestText={item.reschedule_request_text}
                    customerServiceWindowExpiresAt={item.customer_service_window_expires_at}
                  />
                </td>
              </tr>
            ))}
            {!inquiries.length && !error && (
              <tr>
                <td className="p-6 text-gray-500" colSpan={7}>
                  No reservation requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
