"use client";

import { useState, useEffect } from "react";
import { Contact } from "@/lib/supabase";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "call" | "email">("all");

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/contacts");
      const data = await response.json();
      setContacts(data.contacts || []);
    } catch (err) {
      setError("Failed to load contacts");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter((c) =>
    filter === "all" ? true : c.type === filter
  );

  const handleExport = () => {
    const csv = [
      ["Date", "Type", "Source", "IP", "User Agent"],
      ...filteredContacts.map((c) => [
        new Date(c.created_at).toLocaleString(),
        c.type,
        c.source || "",
        c.ip_address || "",
        c.user_agent || "",
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contacts-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Contact Logs</h1>
        <button
          onClick={handleExport}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium"
        >
          📥 Export CSV
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(["all", "call", "email"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded font-medium transition ${
              filter === type
                ? "bg-ranch-dark text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {type === "all" ? "All" : type === "call" ? "Calls" : "Emails"} (
            {contacts.filter((c) => (type === "all" ? true : c.type === type))
              .length}
            )
          </button>
        ))}
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : filteredContacts.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No contacts found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-6 font-semibold text-gray-900">
                    Date & Time
                  </th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-900">
                    Type
                  </th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-900">
                    Source
                  </th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-900">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-6 text-sm text-gray-700">
                      {new Date(contact.created_at).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-6 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          contact.type === "call"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {contact.type === "call" ? "☎️ Call" : "✉️ Email"}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-sm text-gray-700">
                      {contact.source || "—"}
                    </td>
                    <td className="py-3 px-6 text-sm text-gray-500 font-mono">
                      {contact.ip_address}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
