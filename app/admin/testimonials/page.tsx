"use client";

import { useState, useEffect } from "react";
import { Testimonial } from "@/lib/supabase";

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Testimonial>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [newForm, setNewForm] = useState<Partial<Testimonial>>({
    customer_name: "",
    text: "",
    rating: 5,
  });

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/testimonials");
      const data = await response.json();
      setTestimonials(data.testimonials || []);
    } catch (err) {
      setError("Failed to load testimonials");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (testimonial: Testimonial) => {
    setEditingId(testimonial.id);
    setEditForm(testimonial);
  };

  const handleSave = async () => {
    if (!editingId) return;

    try {
      const response = await fetch(`/api/admin/testimonials/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) throw new Error("Save failed");

      setTestimonials(
        testimonials.map((t) =>
          t.id === editingId ? { ...t, ...editForm } : t
        )
      );
      setEditingId(null);
    } catch (err) {
      setError("Failed to save testimonial");
      console.error(err);
    }
  };

  const handleCreateNew = async () => {
    if (!newForm.customer_name || !newForm.text) {
      setError("Name and text are required");
      return;
    }

    try {
      const response = await fetch("/api/admin/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newForm),
      });

      if (!response.ok) throw new Error("Create failed");

      const data = await response.json();
      setTestimonials([...testimonials, data.testimonial]);
      setIsCreating(false);
      setNewForm({ customer_name: "", text: "", rating: 5 });
    } catch (err) {
      setError("Failed to create testimonial");
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;

    try {
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Delete failed");

      setTestimonials(testimonials.filter((t) => t.id !== id));
    } catch (err) {
      setError("Failed to delete testimonial");
      console.error(err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Testimonials</h1>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium"
        >
          {isCreating ? "Cancel" : "+ Add Testimonial"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-4 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {isCreating && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Add New Testimonial
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                value={newForm.customer_name || ""}
                onChange={(e) =>
                  setNewForm({ ...newForm, customer_name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-ranch-brown focus:border-transparent"
                placeholder="John Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Testimonial *
              </label>
              <textarea
                value={newForm.text || ""}
                onChange={(e) =>
                  setNewForm({ ...newForm, text: e.target.value })
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-ranch-brown focus:border-transparent"
                placeholder="What was your experience..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rating
              </label>
              <select
                value={newForm.rating || 5}
                onChange={(e) =>
                  setNewForm({
                    ...newForm,
                    rating: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-ranch-brown focus:border-transparent"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {"⭐".repeat(n)} {n} Stars
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleCreateNew}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded transition"
              >
                Create
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 rounded transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : testimonials.length === 0 ? (
          <p className="text-gray-500">No testimonials yet. Add one!</p>
        ) : (
          testimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              isEditing={editingId === testimonial.id}
              editForm={editForm}
              onStartEdit={() => startEdit(testimonial)}
              onSave={handleSave}
              onCancel={() => setEditingId(null)}
              onDelete={() => handleDelete(testimonial.id)}
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

function TestimonialCard({
  testimonial,
  isEditing,
  editForm,
  onStartEdit,
  onSave,
  onCancel,
  onDelete,
  onEditChange,
}: {
  testimonial: Testimonial;
  isEditing: boolean;
  editForm: Partial<Testimonial>;
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onEditChange: (field: string, value: any) => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name
            </label>
            <input
              type="text"
              value={editForm.customer_name || ""}
              onChange={(e) => onEditChange("customer_name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-ranch-brown focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Testimonial
            </label>
            <textarea
              value={editForm.text || ""}
              onChange={(e) => onEditChange("text", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-ranch-brown focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rating
            </label>
            <select
              value={editForm.rating || 5}
              onChange={(e) =>
                onEditChange("rating", parseInt(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-ranch-brown focus:border-transparent"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {"⭐".repeat(n)} {n} Stars
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onSave}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded transition"
            >
              Save
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
              <p className="text-xs font-semibold text-gray-500 uppercase">
                {"⭐".repeat(testimonial.rating || 5)}
              </p>
              <h3 className="text-lg font-bold text-gray-900 mt-1">
                {testimonial.customer_name}
              </h3>
              <p className="text-gray-700 mt-2">{testimonial.text}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onStartEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded font-medium text-sm"
              >
                Edit
              </button>
              <button
                onClick={onDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded font-medium text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
