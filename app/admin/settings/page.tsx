import CalendarSettings from "@/components/admin/CalendarSettings";
import OwnerNotifications from "@/components/admin/OwnerNotifications";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ calendar?: string }> }) {
  const { calendar } = await searchParams;
  return <div className="mx-auto max-w-4xl space-y-7"><header><h1 className="text-3xl font-bold">Ranch settings</h1><p className="mt-2 text-stone-600">Manage connected calendars, owner alerts, and copies of your business records.</p></header>
    {calendar && <p role="status" className={`rounded-xl p-5 ${calendar === "connected" ? "bg-emerald-50 text-emerald-950" : "bg-amber-50 text-amber-950"}`}>{calendar === "connected" ? "Google Calendar connected. Select the calendars to check below." : "Google Calendar did not connect. Check the app configuration and approve both requested permissions when reconnecting."}</p>}
    <CalendarSettings /><OwnerNotifications />
    <section className="space-y-4 rounded-xl border bg-white p-6"><h2 className="text-xl font-bold">Business records</h2><p className="text-sm text-stone-600">Download a private copy of reservations or contact activity. Files include customer information; keep them in an account you control.</p><div className="flex flex-wrap gap-3"><a className="rounded-lg border px-4 py-3 font-semibold" href="/api/admin/export?type=reservations">Export reservations</a><a className="rounded-lg border px-4 py-3 font-semibold" href="/api/admin/export?type=contacts">Export contact activity</a></div></section>
    <section className="space-y-3 rounded-xl border bg-white p-6"><h2 className="text-xl font-bold">Website measurement</h2><p className="text-sm text-stone-600">{ /^G-[A-Z0-9]{5,20}$/.test(process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || "") ? "A GA4 measurement ID is configured. Verify page visits, call clicks, and direction clicks in JD's GA4 DebugView before launch." : "Waiting for a GA4 property controlled by JD. The website is prepared to measure page visits, call clicks, and direction clicks after guest consent." }</p><p className="text-sm text-stone-600">Private workspace visits and customer details are excluded from website analytics.</p></section>
  </div>;
}
