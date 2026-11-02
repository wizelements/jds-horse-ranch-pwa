"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { BookingInquiry } from "@/lib/bookingStore";

export default function ReservationDetails({ inquiry }: { inquiry: BookingInquiry }) {
  const router = useRouter(), [notice,setNotice] = useState(""), [error,setError] = useState(""), [busy,setBusy] = useState(false);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setNotice(""); setError("");
    const fields = new FormData(event.currentTarget);
    try {
      const response = await fetch(`/api/admin/inquiries/${inquiry.id}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"update_details",customerName:fields.get("name"),phone:fields.get("phone"),email:fields.get("email"),riderCount:Number(fields.get("riders")),riderDetails:fields.get("details"),experience:fields.get("experience")})});
      const data = await response.json(); if(!response.ok)throw new Error(data.error || "Details could not be saved.");
      setNotice("Contact and rider details saved."); router.refresh();
    } catch(cause) {setError(cause instanceof Error ? cause.message : "Details could not be saved.");} finally{setBusy(false);}
  }
  const field="mt-2 block w-full rounded-lg border border-stone-300 bg-white px-3 py-3 text-base text-stone-950";
  return <details className="rounded-xl border bg-white p-5"><summary className="cursor-pointer font-bold">Correct contact or rider details</summary><form onSubmit={save} className="mt-5 space-y-4"><div className="grid gap-4 sm:grid-cols-2">
    <label className="text-sm font-semibold">Contact name<input className={field} name="name" defaultValue={inquiry.customer_name || ""} maxLength={120} required /></label>
    <label className="text-sm font-semibold">Phone<input className={field} type="tel" name="phone" defaultValue={inquiry.customer_phone} required /></label>
    <label className="text-sm font-semibold">Email<input className={field} type="email" name="email" defaultValue={inquiry.email || ""} maxLength={200} /></label>
    <label className="text-sm font-semibold">Number of riders<input className={field} type="number" name="riders" defaultValue={inquiry.rider_count || 1} min={1} max={12} required /></label>
    <label className="text-sm font-semibold sm:col-span-2">Rider details<textarea className={field} name="details" defaultValue={inquiry.rider_details || ""} rows={3} maxLength={2000} /></label>
    <label className="text-sm font-semibold sm:col-span-2">Riding experience<input className={field} name="experience" defaultValue={inquiry.experience || ""} maxLength={800} /></label>
  </div><p className="text-xs leading-6 text-stone-600">This updates this reservation. Correcting a phone number also changes the contact history it appears under. The appointment time and price are managed separately.</p><button disabled={busy} className="rounded-lg bg-emerald-900 px-5 py-3 font-semibold text-white disabled:opacity-50">{busy?"Saving…":"Save contact and rider details"}</button>{notice&&<p role="status" className="text-sm text-emerald-900">{notice}</p>}{error&&<p role="alert" className="text-sm text-red-900">{error}</p>}</form></details>;
}
