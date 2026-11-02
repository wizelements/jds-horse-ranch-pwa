"use client";
import { useEffect, useState } from "react";

type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
export default function WorkspaceStatus() {
  const [offline, setOffline] = useState(false), [install, setInstall] = useState<InstallPrompt | null>(null);
  useEffect(() => {
    const online = () => setOffline(!navigator.onLine);
    const prompt = (event: Event) => { event.preventDefault(); setInstall(event as InstallPrompt); };
    const installed = () => setInstall(null);
    online(); window.addEventListener("online", online); window.addEventListener("offline", online);
    window.addEventListener("beforeinstallprompt", prompt); window.addEventListener("appinstalled", installed);
    return () => { window.removeEventListener("online", online); window.removeEventListener("offline", online); window.removeEventListener("beforeinstallprompt", prompt); window.removeEventListener("appinstalled", installed); };
  }, []);
  return <>
    {offline && <p role="alert" className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">You&apos;re offline. Reconnect before changing reservations or payment details. Private records are not saved for offline use.</p>}
    {install && <button type="button" className="mb-5 rounded-lg border border-emerald-800 bg-white px-4 py-3 text-sm font-semibold" onClick={() => { void install.prompt().then(() => install.userChoice).then(() => setInstall(null)); }}>Install Ranch Manager on this device</button>}
  </>;
}
