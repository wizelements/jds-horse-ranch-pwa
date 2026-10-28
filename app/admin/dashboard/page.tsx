import Link from "next/link";
import { listInquiries, type BookingInquiry } from "@/lib/bookingStore";

const TIME_ZONE = "America/New_York";

function localDay(value: string | Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const get = (type: string) => parts.find((part) => part.type === type)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function when(value: string | null) {
  if (!value) return "Time not set";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function Stat({
  title,
  count,
  description,
  href,
}: {
  title: string;
  count: number;
  description: string;
  href: string;
}) {
  return (
    <Link href={href} className="block rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700">
      <div className="text-sm font-semibold text-stone-700">{title}</div>
      <div className="mt-2 text-4xl font-bold text-ranch-dark">{count}</div>
      <p className="mt-2 text-sm text-stone-600">{description}</p>
    </Link>
  );
}

export default async function DashboardPage() {
  let inquiries: BookingInquiry[] = [];
  let unavailable = false;
  try {
    inquiries = await listInquiries(500);
  } catch (error) {
    unavailable = true;
    console.error("Ranch dashboard bookings unavailable:", error);
  }

  const now = new Date();
  const today = localDay(now);
  const pending = inquiries.filter((ride) => ride.status === "PENDING_JD");
  const awaitingPayment = inquiries.filter((ride) => ride.status === "AWAITING_PAYMENT");
  const booked = inquiries.filter((ride) => ride.status === "BOOKED" && ride.approved_start_at);
  const todaysRides = booked.filter((ride) => localDay(ride.approved_start_at!) === today);
  const upcoming = booked
    .filter((ride) => new Date(ride.approved_start_at!).getTime() >= now.getTime())
    .sort((a, b) => new Date(a.approved_start_at!).getTime() - new Date(b.approved_start_at!).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-800">Ranch management</p>
        <h1 className="mt-2 text-3xl font-bold text-ranch-dark">Today at JD&apos;s Ranch</h1>
        <p className="mt-2 text-stone-700">Your rides, phone conversations, customer records, and next steps in one place.</p>
      </header>

      <Link href="/admin/inquiries/new" className="inline-flex rounded-lg bg-emerald-900 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800">Record a phone conversation</Link>

      {unavailable && (
        <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950">
          Booking information could not be loaded. Counts and schedules are unavailable; no changes have been made.
        </div>
      )}

      {!unavailable && (
        <>
          <section aria-label="Today overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Stat title="Rides today" count={todaysRides.length} description="Confirmed and paid appointments" href="/admin/schedule" />
            <Stat title="Needs JD&apos;s review" count={pending.length} description="Requests awaiting your decision" href="/admin/inquiries" />
            <Stat title="Awaiting payment" count={awaitingPayment.length} description="Approved, not yet confirmed" href="/admin/inquiries" />
          </section>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm" aria-labelledby="pending-heading">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 id="pending-heading" className="text-xl font-bold text-ranch-dark">Requests that need you</h2>
                <Link className="font-semibold text-emerald-800 underline" href="/admin/inquiries">Review all</Link>
              </div>
              {pending.length === 0 ? (
                <p className="text-stone-600">No requests awaiting review.</p>
              ) : (
                <ul className="divide-y divide-stone-200">
                  {pending.slice(0, 6).map((ride) => (
                    <li key={ride.id} className="py-3">
                      <p className="font-semibold text-stone-950">{ride.customer_name || "Customer not named"}</p>
                      <p className="text-sm text-stone-700">{ride.service_requested || "Experience not selected"} · {ride.rider_count || "—"} riders</p>
                      <p className="text-sm text-stone-600">Preferred: {ride.requested_datetime_text || "Not supplied"}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm" aria-labelledby="upcoming-heading">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 id="upcoming-heading" className="text-xl font-bold text-ranch-dark">Upcoming confirmed rides</h2>
                <Link className="font-semibold text-emerald-800 underline" href="/admin/schedule">Full schedule</Link>
              </div>
              {upcoming.length === 0 ? (
                <p className="text-stone-600">No upcoming confirmed rides in the recent records.</p>
              ) : (
                <ul className="divide-y divide-stone-200">
                  {upcoming.map((ride) => (
                    <li key={ride.id} className="py-3">
                      <p className="font-semibold text-stone-950">{when(ride.approved_start_at)}</p>
                      <p className="text-sm text-stone-700">{ride.service_requested || "Ride"} · {ride.customer_name || "Customer not named"}</p>
                      <p className="text-sm text-stone-600">{ride.rider_count || "—"} riders · Confirmed</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <p className="text-sm text-stone-600">
            This overview uses the most recent 500 reservation records. It shows only verified booking statuses; connected external calendar availability is not included yet.
          </p>
        </>
      )}
    </div>
  );
}
