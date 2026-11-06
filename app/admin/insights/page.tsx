import Link from "next/link";
import { getTurso } from "@/lib/turso";

export const dynamic = "force-dynamic";
export const metadata = { title: "Customer Interest | JD's Ranch", robots: { index: false, follow: false } };

type SourceRow = { source: string; n: number };
type DayRow = { day: string; n: number };
function readable(source: string) {
  const names: Record<string, string> = {
    navigation: "Top navigation",
    experiences: "Riding experience options",
    gallery: "Photo gallery",
    "plan-visit": "Visit information",
    "about-ranch": "About the ranch",
    "call-to-book": "Booking invitation",
  };
  return names[source] || source.replace(/[_-]/g, " ").replace(/\b\w/g, s => s.toUpperCase());
}

export default async function CustomerInterestPage() {
  let days: DayRow[] = [], sources: SourceRow[] = [];
  let week = 0, month = 0, unavailable = false;
  try {
    const since30 = new Date(Date.now() - 30 * 86400000).toISOString();
    const since7 = new Date(Date.now() - 7 * 86400000).toISOString();
    const rows = await getTurso().batch([
      {
        sql: "SELECT COUNT(*) AS n FROM contacts WHERE type='call' AND source != 'qa-smoke' AND created_at >= ?",
        args: [since7],
      },
      {
        sql: "SELECT COUNT(*) AS n FROM contacts WHERE type='call' AND source != 'qa-smoke' AND created_at >= ?",
        args: [since30],
      },
      {
        sql: "SELECT source, COUNT(*) AS n FROM contacts WHERE type='call' AND source != 'qa-smoke' AND created_at >= ? GROUP BY source ORDER BY n DESC LIMIT 15",
        args: [since30],
      },
      {
        sql: "SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS n FROM contacts WHERE type='call' AND source != 'qa-smoke' AND created_at >= ? GROUP BY substr(created_at, 1, 10) ORDER BY day DESC LIMIT 30",
        args: [since30],
      },
    ], "read");
    week = Number(rows[0].rows[0]?.n || 0);
    month = Number(rows[1].rows[0]?.n || 0);
    sources = rows[2].rows.map(row => ({ source: String(row.source || "unknown"), n: Number(row.n || 0) }));
    days = rows[3].rows.map(row => ({ day: String(row.day), n: Number(row.n || 0) }));
  } catch {
    unavailable = true;
  }
  return <div className="mx-auto max-w-5xl space-y-7">
    <header className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-[.15em] text-emerald-800">Owner-only performance</p>
      <h1 className="text-3xl font-bold text-stone-950">Interest in riding</h1>
      <p className="max-w-3xl leading-7 text-stone-700">These are anonymous taps on the website&apos;s call buttons, recorded only when a visitor allows optional analytics. They are not answered calls, payments, confirmed rides, or unique customers.</p>
    </header>
    {unavailable ? <p role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-950">Call activity cannot be loaded from the ranch database. No totals are being estimated.</p> :
      <>
        <section className="grid gap-4 sm:grid-cols-2" aria-label="Call intent">
          <div className="rounded-2xl border bg-white p-6"><p className="text-sm font-semibold text-stone-600">Call-button taps · last 7 days</p><p className="mt-2 text-5xl font-bold text-emerald-950">{week}</p></div>
          <div className="rounded-2xl border bg-white p-6"><p className="text-sm font-semibold text-stone-600">Call-button taps · last 30 days</p><p className="mt-2 text-5xl font-bold text-emerald-950">{month}</p></div>
        </section>
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border bg-white p-6">
            <h2 className="text-xl font-bold">Where visitors tapped</h2>
            {sources.length ? <ol className="mt-5 space-y-3">{sources.map(row => <li key={row.source} className="flex items-center justify-between gap-4 border-b pb-3"><span>{readable(row.source)}</span><strong>{row.n}</strong></li>)}</ol> : <p className="mt-4 text-stone-600">No consented call taps recorded in the past 30 days.</p>}
          </div>
          <div className="rounded-2xl border bg-white p-6">
            <h2 className="text-xl font-bold">Day-by-day activity</h2>
            <p className="mt-2 text-xs text-stone-500">Days grouped in UTC, newest first</p>
            {days.length ? <ol className="mt-5 max-h-80 space-y-3 overflow-auto">{days.map(row => <li key={row.day} className="flex justify-between gap-4 border-b pb-3"><span>{row.day}</span><strong>{row.n}</strong></li>)}</ol> : <p className="mt-4 text-stone-600">No activity yet.</p>}
          </div>
        </section>
      </>
    }
    <section className="rounded-xl border border-[#c7d3c5] bg-[#f0f5ef] p-5">
      <h2 className="font-bold text-emerald-950">Turn interest into reservations</h2>
      <p className="mt-2 text-sm leading-7">Compare these anonymous button taps with the calls JD actually receives and manually records. A tap does not prove a conversation took place. Search keywords and page rankings must come from Google Search Console, not this counter.</p>
      <Link className="mt-4 inline-block rounded-lg bg-emerald-900 px-5 py-3 text-sm font-bold text-white" href="/admin/inquiries/new">Record a customer call</Link>
    </section>
  </div>;
}
