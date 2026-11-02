import Link from "next/link";
import { getInquiry } from "@/lib/bookingStore";
import { getTurso } from "@/lib/turso";
import { ranchTime } from "@/lib/ranch";
import { bookingLabels, formatMoney } from "@/lib/bookingDisplay";

export default async function CustomerHistory({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ page?: string }> }) {
  const { id } = await params, query = await searchParams, page = Math.max(1, Number.parseInt(query.page || "1") || 1);
  try {
    const contact = await getInquiry(id);
    const result = await getTurso().batch([
      { sql: "SELECT * FROM booking_inquiries WHERE customer_phone=? ORDER BY created_at DESC LIMIT 25 OFFSET ?", args: [contact.customer_phone, (page - 1) * 25] },
      { sql: "SELECT COUNT(*) AS total,SUM(CASE WHEN status='COMPLETED' THEN 1 ELSE 0 END) AS visits FROM booking_inquiries WHERE customer_phone=?", args: [contact.customer_phone] },
    ], "read");
    const total = Number(result[1].rows[0].total);
    return <div className="mx-auto max-w-4xl space-y-6"><Link href="/admin/customers" className="underline">← Customers</Link><header><h1 className="text-3xl font-bold">{contact.customer_name || "Contact history"}</h1><p className="mt-2">{contact.customer_phone}</p><p className="mt-2 text-sm text-stone-600">{total} requests · {Number(result[1].rows[0].visits)} completed visits. Other riders may share this number.</p></header>
      <div className="space-y-4">{result[0].rows.map(item => <article key={String(item.id)} className="rounded-xl border bg-white p-5"><div className="flex flex-wrap justify-between gap-3"><h2 className="text-lg font-bold">{String(item.customer_name || "Unnamed caller")} · {String(item.service_requested || "Ranch experience")}</h2><span className="text-sm font-semibold">{bookingLabels[String(item.status)]}</span></div><p className="mt-2 text-sm text-stone-600">{item.approved_start_at ? ranchTime(String(item.approved_start_at)) : ranchTime(String(item.created_at))} · {Number(item.rider_count || 0)} riders · {formatMoney(item.approved_amount_cents == null ? null : Number(item.approved_amount_cents))}</p><Link href={`/admin/inquiries/${item.id}`} className="mt-4 inline-block font-semibold underline">Review reservation →</Link></article>)}</div>
      <nav className="flex justify-between" aria-label="History pages">{page > 1 ? <Link href={`/admin/customers/${id}?page=${page - 1}`} className="underline">← Previous</Link> : <span />}<span className="text-sm">Page {page} of {Math.max(1, Math.ceil(total / 25))}</span>{page * 25 < total ? <Link href={`/admin/customers/${id}?page=${page + 1}`} className="underline">Next →</Link> : <span />}</nav>
    </div>;
  } catch { return <p role="alert" className="rounded-xl bg-red-50 p-5 text-red-950">This contact history could not be loaded.</p>; }
}
