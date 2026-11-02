"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      await fetch("/api/admin/logout", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      router.replace("/ranch-login"); router.refresh();
    };

    logout();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-ranch-brown to-ranch-dark flex items-center justify-center">
      <p className="text-white text-lg">Logging out...</p>
    </div>
  );
}
