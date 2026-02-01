import { getContacts } from "@/lib/supabase";

export default async function DashboardPage() {
  let recentContacts = [];
  let error: string | null = null;

  try {
    recentContacts = await getContacts(5);
  } catch (err) {
    error = "Failed to load contacts";
    console.error(err);
  }

  const callCount = recentContacts.filter((c) => c.type === "call").length;
  const emailCount = recentContacts.filter((c) => c.type === "email").length;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          label="Recent Contacts"
          value={recentContacts.length}
          icon="📞"
        />
        <StatCard label="Calls" value={callCount} icon="☎️" />
        <StatCard label="Emails" value={emailCount} icon="✉️" />
      </div>

      {/* Recent Contacts */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Contacts</h2>

        {recentContacts.length === 0 ? (
          <p className="text-gray-500">No contacts yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Time</th>
                  <th className="text-left py-2 px-2">Type</th>
                  <th className="text-left py-2 px-2">Source</th>
                  <th className="text-left py-2 px-2">IP</th>
                </tr>
              </thead>
              <tbody>
                {recentContacts.map((contact) => (
                  <tr key={contact.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-2 text-gray-600">
                      {new Date(contact.created_at).toLocaleString()}
                    </td>
                    <td className="py-2 px-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          contact.type === "call"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {contact.type}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-gray-700">
                      {contact.source || "—"}
                    </td>
                    <td className="py-2 px-2 text-gray-500">
                      {contact.ip_address}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4">
          <a
            href="/admin/contacts"
            className="text-ranch-brown hover:text-ranch-dark font-medium"
          >
            View all contacts →
          </a>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <p className="text-4xl">{icon}</p>
      </div>
    </div>
  );
}
