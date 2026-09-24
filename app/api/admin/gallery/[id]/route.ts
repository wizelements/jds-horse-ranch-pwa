import { NextRequest, NextResponse } from "next/server";
import {
  deleteGalleryPhoto,
  getGalleryPhoto,
  updateGalleryPhoto,
} from "@/lib/turso";
import { verifyAdminSession } from "@/lib/auth";
import { getGalleryStorage } from "@/lib/storage";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!(await verifyAdminSession())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    await updateGalleryPhoto(id, body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating gallery photo:", error);
    return NextResponse.json(
      { error: "Failed to update photo" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!(await verifyAdminSession())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const photo = await getGalleryPhoto(id);
    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    const filename = photo.image_url.split("/").pop()?.split("?")[0] || null;
    if (filename) {
      const { error: storageError } = await getGalleryStorage()
        .storage.from("gallery-photos")
        .remove([filename]);
      if (storageError) {
        console.warn("Gallery object delete failed:", storageError.message);
      }
    }

    await deleteGalleryPhoto(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting gallery photo:", error);
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}
