import InquiryActions from "@/components/admin/InquiryActions";
import { listWhatsAppInquiries } from "@/lib/whatsappStore";

export default async function InquiriesPage() {
  let inquiries = [];
  let error: string | null = null;

  try {
    inquiries = await listWhatsAppInquiries(100);
  } catch (err) {
    console.error(err);
    error =
      "Could not load WhatsApp inquiries. Apply migration 002 and configure SUPABASE_SERVICE_ROLE_KEY.";
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">WhatsApp Inquiries</h1>
      <p className="text-gray-600 mb-6">
        JD remains the approval authority. Payment is sent only after JD speaks with the customer and approves the request.
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
              <th className="text-left p-3">Created</th>
              <th className="text-left p-3">Customer</th>
              <th className="text-left p-3">Riders</th>
              <th className="text-left p-3">Requested time</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">24h hold</th>
              <th className="text-left p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((item) => (
              <tr key={item.id} className="border-b align-top">
                <td className="p-3 text-gray-600">
                  {new Date(item.created_at).toLocaleString()}
                </td>
                <td className="p-3">
                  <div className="font-medium">{item.customer_name || "—"}</div>
                  <div className="text-gray-500">{item.customer_phone}</div>
                </td>
                <td className="p-3">
                  <div>{item.rider_count || "—"}</div>
                  <div className="text-xs text-gray-500 max-w-xs">{item.rider_details || ""}</div>
                </td>
                <td className="p-3 max-w-xs">{item.requested_datetime_text || "—"}</td>
                <td className="p-3 font-medium">{item.status}</td>
                <td className="p-3 text-gray-600">
                  {item.hold_expires_at
                    ? new Date(item.hold_expires_at).toLocaleString()
                    : "—"}
                </td>
                <td className="p-3">
                  <InquiryActions id={item.id} status={item.status} />
                </td>
              </tr>
            ))}
            {!inquiries.length && !error && (
              <tr>
                <td className="p-6 text-gray-500" colSpan={7}>
                  No WhatsApp inquiries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
