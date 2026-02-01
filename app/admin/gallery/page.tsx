"use client";

import { useState, useEffect } from "react";
import { GalleryPhoto } from "@/lib/supabase";
import Image from "next/image";

export default function GalleryPage() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<GalleryPhoto>>({});

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/gallery");
      const data = await response.json();
      setPhotos(data.photos || []);
    } catch (err) {
      setError("Failed to load photos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", file.name.replace(/\.[^/.]+$/, ""));

      const response = await fetch("/api/admin/gallery/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setPhotos([...photos, data.photo]);
      e.target.value = ""; // Reset input
    } catch (err) {
      setError("Failed to upload photo");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const startEdit = (photo: GalleryPhoto) => {
    setEditingId(photo.id);
    setEditForm(photo);
  };

  const handleSave = async () => {
    if (!editingId) return;

    try {
      const response = await fetch(`/api/admin/gallery/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) throw new Error("Save failed");

      setPhotos(
        photos.map((p) => (p.id === editingId ? { ...p, ...editForm } : p))
      );
      setEditingId(null);
    } catch (err) {
      setError("Failed to save photo");
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this photo?")) return;

    try {
      const response = await fetch(`/api/admin/gallery/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Delete failed");

      setPhotos(photos.filter((p) => p.id !== id));
    } catch (err) {
      setError("Failed to delete photo");
      console.error(err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gallery</h1>
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

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Upload Photo</h2>
        <div className="flex items-center gap-4">
          <label className="flex-1">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-ranch-brown transition">
              <p className="text-gray-600">
                {uploading ? "Uploading..." : "Click to select photo"}
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </div>
          </label>
        </div>
      </div>

      {/* Photos Grid */}
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : photos.length === 0 ? (
        <p className="text-gray-500">No photos yet. Upload one!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {photos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              isEditing={editingId === photo.id}
              editForm={editForm}
              onStartEdit={() => startEdit(photo)}
              onSave={handleSave}
              onCancel={() => setEditingId(null)}
              onDelete={() => handleDelete(photo.id)}
              onEditChange={(field, value) =>
                setEditForm({ ...editForm, [field]: value })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PhotoCard({
  photo,
  isEditing,
  editForm,
  onStartEdit,
  onSave,
  onCancel,
  onDelete,
  onEditChange,
}: {
  photo: GalleryPhoto;
  isEditing: boolean;
  editForm: Partial<GalleryPhoto>;
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onEditChange: (field: string, value: any) => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="relative w-full h-48 bg-gray-200">
        <Image
          src={photo.image_url}
          alt={photo.title || "Gallery photo"}
          fill
          className="object-cover"
        />
      </div>

      <div className="p-6">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={editForm.title || ""}
                onChange={(e) => onEditChange("title", e.target.value)}
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
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-ranch-brown focus:border-transparent"
              />
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
            <h3 className="text-lg font-bold text-gray-900">
              {photo.title || "Untitled"}
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              {photo.description || "No description"}
            </p>

            <div className="flex gap-2 mt-4">
              <button
                onClick={onStartEdit}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium text-sm"
              >
                Edit
              </button>
              <button
                onClick={onDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded font-medium text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
