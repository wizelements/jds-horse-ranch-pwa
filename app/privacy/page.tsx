import Link from "next/link";

export const metadata = { title: "Privacy | JD's Horse Ranch", alternates: { canonical: "/privacy" } };
export default function PrivacyPage() {
  return <main className="mx-auto min-h-screen max-w-3xl space-y-7 px-6 py-16 text-stone-900">
    <Link href="/" className="font-semibold underline">← JD&apos;s Horse Ranch</Link>
    <h1 className="font-editorial text-5xl">Your privacy</h1>
    <p>Reservations begin with a phone conversation. JD keeps the contact details, rider information, scheduling notes, and payment references needed to arrange and manage your visit in a private workspace.</p>
    <p>Payments use Square checkout. Card details are handled by Square and are never stored by this website. Visiting a payment return page does not confirm a reservation; payment must be verified separately.</p>
    <p>Optional Google Analytics measures page visits, call button clicks, and direction clicks only after you allow it. Rider names, phone numbers, payment references, and private workspace activity are excluded. You can reset your choice using Analytics preferences on the home page. Browser privacy signals are respected.</p>
    <p>External links and the ranch video may connect to Google, YouTube, or social networks, which have their own privacy practices. Website preferences and public app assets may be stored on your device. Private customer records and payment pages are never cached for offline use.</p>
    <p>To discuss your information or request a correction or deletion, call JD at <a className="underline" href="tel:+14049812361">(404) 981-2361</a>. Some records may need to be retained for business, payment, or legal obligations.</p>
  </main>;
}
