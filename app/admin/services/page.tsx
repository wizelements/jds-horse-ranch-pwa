"use client";

import { useState, useEffect } from "react";
import { Service } from "@/lib/supabase";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Service>>({});

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/services");
      const data = await response.json();
      setServices(data.services || []);
    } catch (err) {
      setError("Failed to load services");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (service: Service) => {
    setEditingId(service.id);
    setEditForm(service);
  };

  const handleSave = async () => {
    if (!editingId) return;

    try {
      const response = await fetch(`/api/admin/services/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) throw new Error("Save failed");

      setServices(
        services.map((s) => (s.id === editingId ? { ...s, ...editForm } : s))
      );
      setEditingId(null);
    } catch (err) {
      setError("Failed to save service");
      console.error(err);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Services</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              isEditing={editingId === service.id}
              editForm={editForm}
              onStartEdit={() => startEdit(service)}
              onSave={handleSave}
              onCancel={handleCancel}
              onEditChange={(field, value) =>
                setEditForm({ ...editForm, [field]: value })
              }
            />
          ))
        )}
      </div>
    </div>
  );
}

function ServiceCard({
  service,
  isEditing,
  editForm,
  onStartEdit,
  onSave,
  onCancel,
  onEditChange,
}: {
  service: Service;
  isEditing: boolean;
  editForm: Partial<Service>;
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onEditChange: (field: string, value: any) => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Name
            </label>
            <input
              type="text"
              value={editForm.name || ""}
              onChange={(e) => onEditChange("name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-ranch-brown focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={editForm.description || ""}
              onChange={(e) => onEditChange("description", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-ranch-brown focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Price
              </label>
              <input
                type="number"
                value={editForm.price_min || ""}
                onChange={(e) =>
                  onEditChange("price_min", parseFloat(e.target.value) || 0)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-ranch-brown focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Price
              </label>
              <input
                type="number"
                value={editForm.price_max || ""}
                onChange={(e) =>
                  onEditChange("price_max", parseFloat(e.target.value) || 0)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-ranch-brown focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={editForm.duration_minutes || ""}
                onChange={(e) =>
                  onEditChange("duration_minutes", parseInt(e.target.value) || 0)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-ranch-brown focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age Requirement
              </label>
              <input
                type="text"
                value={editForm.age_requirement || ""}
                onChange={(e) => onEditChange("age_requirement", e.target.value)}
                placeholder="e.g., 8+"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-ranch-brown focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onSave}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded transition"
            >
              Save Changes
            </button>
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 rounded transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
              <p className="text-gray-600 mt-1">{service.description}</p>
            </div>
            <button
              onClick={onStartEdit}
              className="bg-ranch-brown hover:bg-ranch-dark text-white px-4 py-2 rounded font-medium"
            >
              Edit
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">
                Price
              </p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                ${service.price_min || 0} - ${service.price_max || 0}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">
                Duration
              </p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {service.duration_minutes} min
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">
                Age
              </p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {service.age_requirement || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">
                Status
              </p>
              <p className="text-lg font-bold text-green-600 mt-1">
                {service.active ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
