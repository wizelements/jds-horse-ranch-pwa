export const dynamic = "force-dynamic";
export const metadata = { manifest: "/ranch-manifest.json", robots: { index: false, follow: false } };

import { verifyAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

const sections = [
  {href:"/admin/dashboard", label:"Today"},
  {href:"/admin/schedule", label:"Ride Schedule"},
  {href:"/admin/inquiries", label:"Reservations"},
  {href:"/admin/inquiries/new", label:"Record Phone Call"},
  {href:"/admin/customers", label:"Customers"},
  {href:"/admin/services", label:"Experiences"},
  {href:"/admin/gallery", label:"Photos"},
  {href:"/admin/testimonials", label:"Reviews"},
  {href:"/admin/contacts", label:"Contact Activity"},
];

export default async function AdminLayout({children}:{children:React.ReactNode}) {
  if (!(await verifyAdminSession())) redirect("/ranch-login");
  return <div className="min-h-screen bg-stone-50 text-stone-950">
    <header className="bg-ranch-dark px-4 py-4 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div><p className="text-xs font-semibold uppercase tracking-widest text-amber-100">Private ranch workspace</p>
          <p className="text-xl font-bold">JD&apos;s Horse Ranch</p></div>
        <Link href="/admin/logout" className="rounded-lg border border-white/50 px-3 py-2 text-sm font-semibold hover:bg-white/10">Sign out</Link>
      </div>
    </header>
    <div className="mx-auto max-w-7xl px-4 py-6">
      <nav aria-label="Ranch management" className="mb-7 flex gap-2 overflow-x-auto pb-2">
        {sections.map(s=><Link key={s.href} href={s.href} className="shrink-0 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-ranch-dark hover:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700">{s.label}</Link>)}
      </nav>
      <main>{children}</main>
    </div>
  </div>;
}
