import { verifyAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = await verifyAdminSession();

  if (!isAuthenticated) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-ranch-dark text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">JD&apos;s Ranch Admin</h1>
            <a
              href="/admin/logout"
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm"
            >
              Logout
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <aside className="mb-8 flex gap-4 flex-wrap">
          <NavLink href="/admin/dashboard" label="Dashboard" />
          <NavLink href="/admin/services" label="Services" />
          <NavLink href="/admin/testimonials" label="Testimonials" />
          <NavLink href="/admin/gallery" label="Gallery" />
          <NavLink href="/admin/contacts" label="Contact Logs" />
        </aside>

        <main>{children}</main>
      </div>
    </div>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="bg-white text-ranch-dark px-4 py-2 rounded hover:bg-gray-200 transition font-medium text-sm"
    >
      {label}
    </a>
  );
}
