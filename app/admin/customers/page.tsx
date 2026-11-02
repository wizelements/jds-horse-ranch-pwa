import Link from "next/link";
import { getTurso } from "@/lib/turso";
import { ranchTime } from "@/lib/ranch";

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const params = await searchParams, q = String(params.q || "").trim().slice(0, 120), page = Math.max(1, Number.parseInt(params.page || "1") || 1);
  let items: Record<string, unknown>[] = [], total = 0, error = false;
  try {
    const where = q ? "WHERE customer_phone IN (SELECT customer_phone FROM booking_inquiries WHERE customer_name LIKE ? OR customer_phone LIKE ?)" : "";
    const args = q ? [`%${q}%`, `%${q}%`] : [];
    const result = await getTurso().batch([
      { sql: `SELECT customer_phone,COUNT(*) AS requests,SUM(CASE WHEN status='COMPLETED' THEN 1 ELSE 0 END) AS visits,MAX(created_at) AS latest FROM booking_inquiries ${where} GROUP BY customer_phone ORDER BY latest DESC LIMIT 25 OFFSET ?`, args: [...args, (page - 1) * 25] },
      { sql: `SELECT COUNT(DISTINCT customer_phone) AS n FROM booking_inquiries ${where}`, args },
    ], "read");
    total = Number(result[1].rows[0].n);
    const contacts = await Promise.all(result[0].rows.map(async row => {
      const latest = await getTurso().execute({ sql: "SELECT id,customer_name,email FROM booking_inquiries WHERE customer_phone=? ORDER BY created_at DESC LIMIT 1", args: [String(row.customer_phone)] });
      return { ...row, ...latest.rows[0] } as Record<string, unknown>;
    }));
    items = contacts;
  } catch { error = true; }
  const link = (p: number) => `/admin/customers?${new URLSearchParams({ q, page: String(p) })}`;
  return <div className="space-y-6"><header><h1 className="text-3xl font-bold">Customer history</h1><p className="mt-2 text-stone-600">Find past conversations, requests, and visits.</p></header>
    <form method="get" className="flex flex-wrap gap-3"><label className="flex-1 text-sm font-semibold">Find a contact<input className="mt-2 block w-full rounded-lg border bg-white px-4 py-3" name="q" defaultValue={q} placeholder="Name or phone number" /></label><button className="self-end rounded-lg bg-emerald-900 px-5 py-3 font-semibold text-white">Search</button></form>
    <p className="rounded-xl bg-stone-100 p-4 text-sm text-stone-700">Histories are grouped by contact phone number. Families may share a number; this does not establish individual rider identity.</p>
    {error ? <p role="alert" className="rounded-xl bg-red-50 p-5 text-red-950">Customer histories could not be loaded.</p> : <><p className="text-sm text-stone-600">{total} contacts</p><div className="grid gap-4 lg:grid-cols-2">{items.map(item => <article key={String(item.customer_phone)} className="space-y-3 rounded-xl border bg-white p-5"><h2 className="text-xl font-bold">{String(item.customer_name || "Unnamed contact")}</h2><p>{String(item.customer_phone)}</p><p className="text-sm text-stone-600">{Number(item.requests)} requests · {Number(item.visits)} completed visits</p><p className="text-sm text-stone-600">Last recorded {ranchTime(String(item.latest))}</p><Link href={`/admin/customers/${item.id}`} className="inline-block rounded-lg bg-emerald-900 px-4 py-3 text-sm font-semibold text-white">Open full history</Link></article>)}</div>{!items.length && <p className="rounded-xl border bg-white p-6">No contacts match this search.</p>}<nav aria-label="Customer pages" className="flex justify-between">{page > 1 ? <Link className="underline" href={link(page - 1)}>← Previous</Link> : <span />}<span className="text-sm">Page {page} of {Math.max(1, Math.ceil(total / 25))}</span>{page * 25 < total ? <Link className="underline" href={link(page + 1)}>Next →</Link> : <span />}</nav></>}
  </div>;
}
