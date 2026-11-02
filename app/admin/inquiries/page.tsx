import Link from "next/link";
import { getTurso } from "@/lib/turso";
import { bookingLabels, formatMoney } from "@/lib/bookingDisplay";
import { ranchTime } from "@/lib/ranch";

export default async function InquiriesPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
  const search = await searchParams, q = String(search.q || "").trim().slice(0, 120);
  const status = bookingLabels[search.status || ""] ? search.status! : "";
  const page = Math.max(1, Math.min(10000, Number.parseInt(search.page || "1") || 1));
  const where = ["1=1"], args: (string | number)[] = [];
  if (q) { where.push("(customer_name LIKE ? OR customer_phone LIKE ? OR service_requested LIKE ?)"); args.push(...Array(3).fill(`%${q}%`)); }
  if (status) { where.push("status=?"); args.push(status); }
  let items: Record<string, unknown>[] = [], total = 0, error = false;
  try {
    const result = await getTurso().batch([
      { sql: `SELECT * FROM booking_inquiries WHERE ${where.join(" AND ")} ORDER BY created_at DESC LIMIT 25 OFFSET ?`, args: [...args, (page - 1) * 25] },
      { sql: `SELECT COUNT(*) AS n FROM booking_inquiries WHERE ${where.join(" AND ")}`, args },
    ], "read");
    items = result[0].rows as Record<string, unknown>[]; total = Number(result[1].rows[0].n);
  } catch { error = true; }
  const link = (p: number) => `/admin/inquiries?${new URLSearchParams({ q, status, page: String(p) })}`;
  return <div className="space-y-6">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-3xl font-bold">Reservations</h1><p className="mt-2 text-stone-600">Keep phone conversations, approvals, and verified bookings in one place.</p></div><Link href="/admin/inquiries/new" className="rounded-lg bg-emerald-900 px-5 py-3 font-semibold text-white">Record a phone call</Link></header>
    <form method="get" className="flex flex-wrap items-end gap-3 rounded-xl border bg-white p-4"><label className="flex-1 text-sm font-semibold">Find a request<input name="q" defaultValue={q} placeholder="Name, phone, or experience" className="mt-2 block w-full min-w-44 rounded-lg border px-3 py-3" /></label><label className="text-sm font-semibold">Status<select name="status" defaultValue={status} className="mt-2 block rounded-lg border px-3 py-3"><option value="">All statuses</option>{Object.entries(bookingLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label><button className="rounded-lg bg-emerald-900 px-5 py-3 font-semibold text-white">Search</button></form>
    {error ? <p role="alert" className="rounded-xl bg-red-50 p-5 text-red-900">Reservations could not be loaded. Try again when the connection is restored.</p> : <>
      <p className="text-sm text-stone-600">{total} matching request{total === 1 ? "" : "s"}</p>
      <div className="grid gap-4 lg:grid-cols-2">{items.map(item => <article key={String(item.id)} className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-bold">{String(item.customer_name || "Unnamed caller")}</h2><p className="mt-1 text-sm text-stone-600">{String(item.service_requested || "Ranch experience")} · {Number(item.rider_count || 0)} riders</p></div><span className="rounded-full bg-stone-100 px-3 py-2 text-sm font-semibold">{bookingLabels[String(item.status)]}</span></div>
        <p className="mt-4 text-sm">{item.approved_start_at ? ranchTime(String(item.approved_start_at)) : String(item.requested_datetime_text || "Time to be discussed")}</p>
        <p className="mt-2 text-sm text-stone-600">Approved total: {formatMoney(item.approved_amount_cents == null ? null : Number(item.approved_amount_cents))}</p>
        <div className="mt-5 flex flex-wrap gap-3"><Link href={`/admin/inquiries/${item.id}`} className="rounded-lg bg-emerald-900 px-4 py-3 text-sm font-semibold text-white">Review reservation</Link><a href={`tel:${item.customer_phone}`} className="rounded-lg border px-4 py-3 text-sm font-semibold">Call customer</a></div>
      </article>)}</div>
      {!items.length && <p className="rounded-xl border bg-white p-8 text-stone-600">No matching requests. Record a phone conversation to get started.</p>}
      <nav aria-label="Reservation pages" className="flex items-center justify-between gap-4">{page > 1 ? <Link className="underline" href={link(page - 1)}>← Previous</Link> : <span />}<span className="text-sm">Page {page} of {Math.max(1, Math.ceil(total / 25))}</span>{page * 25 < total ? <Link className="underline" href={link(page + 1)}>Next →</Link> : <span />}</nav>
    </>}
  </div>;
}
