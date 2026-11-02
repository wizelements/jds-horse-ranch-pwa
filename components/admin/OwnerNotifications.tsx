"use client";
import { useEffect, useState } from "react";

type Settings = { configured: boolean; config: { apiKey: string; appId: string; projectId: string; messagingSenderId: string }; vapidKey: string; devices: { id: string; label: string }[] };
export default function OwnerNotifications() {
  const [settings, setSettings] = useState<Settings | null>(null), [notice, setNotice] = useState(""), [busy, setBusy] = useState(false);
  async function load() { const response = await fetch("/api/admin/notifications"); if (response.ok) setSettings(await response.json()); else setNotice("Notification settings could not be loaded."); }
  useEffect(() => { void load(); }, []);
  async function request(body: Record<string, unknown>) {
    const response = await fetch("/api/admin/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json(); if (!response.ok) throw new Error(data.error || "Notification action failed."); return data;
  }
  async function enable() {
    if (!settings?.configured) return;
    setBusy(true); setNotice("");
    try {
      if (!("Notification" in window) || !("serviceWorker" in navigator)) throw new Error("This browser does not support app notifications.");
      if (await Notification.requestPermission() !== "granted") throw new Error("Notifications were not allowed. You can change this in your browser settings.");
      const [{ initializeApp, getApps }, { getMessaging, getToken, isSupported }] = await Promise.all([import("firebase/app"), import("firebase/messaging")]);
      if (!(await isSupported())) throw new Error("Firebase notifications are not supported on this device.");
      const app = getApps().find(a => a.name === "ranch-owner") || initializeApp(settings.config, "ranch-owner");
      const registration = await navigator.serviceWorker.ready;
      const token = await getToken(getMessaging(app), { vapidKey: settings.vapidKey, serviceWorkerRegistration: registration });
      await request({ action: "register_device", token, label: /Android/i.test(navigator.userAgent) ? "Android owner device" : "Owner browser" });
      setNotice("Device registered. Send a test and verify it arrives before relying on alerts."); await load();
    } catch (cause) { setNotice(cause instanceof Error ? cause.message : "Notifications could not be enabled."); }
    finally { setBusy(false); }
  }
  return <section className="space-y-4 rounded-xl border bg-white p-6"><h2 className="text-xl font-bold">Owner notifications</h2><p className="text-sm text-stone-600">Receive a private-workspace alert when a payment is verified. Notifications contain no customer or rider details.</p>
    {!settings ? <p className="text-sm">Loading notification settings…</p> : <>
      <p className="text-sm font-semibold">{settings.configured ? "Firebase configured · device receipt still needs verification" : "Waiting for the ranch Firebase configuration"}</p>
      <div className="flex flex-wrap gap-3"><button type="button" disabled={busy || !settings.configured} onClick={() => void enable()} className="rounded-lg bg-emerald-900 px-4 py-3 font-semibold text-white disabled:opacity-50">Enable on this device</button><button type="button" disabled={!settings.configured || busy} className="rounded-lg border px-4 py-3" onClick={() => { setBusy(true); void request({ action: "test" }).then(result => setNotice(result.message)).catch(error => setNotice(error.message)).finally(() => setBusy(false)); }}>Send test alert</button></div>
      {settings.devices.map(device => <div key={device.id} className="flex items-center justify-between gap-3 border-t pt-3 text-sm"><span>{device.label}</span><button type="button" className="px-3 py-2 text-red-800 underline" onClick={() => void request({ action: "remove_device", id: device.id }).then(load).catch(error => setNotice(error.message))}>Remove device</button></div>)}
    </>}
    {notice && <p role="status" className="rounded-lg bg-stone-100 p-4 text-sm">{notice}</p>}
  </section>;
}
