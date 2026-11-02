import { revalidatePath, revalidateTag } from "next/cache";
import { RanchError } from "@/lib/errors";
import { publicContentPatch } from "@/lib/contentValidation";
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
    await updateGalleryPhoto(id, publicContentPatch(body, "photo"));
    revalidateTag("ranch-public-content"); revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof RanchError) return NextResponse.json({ error: error.message }, { status: error.status });
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

    const base = process.env.SUPABASE_STORAGE_URL;
    if (base && photo.image_url.startsWith(base.replace(/\/$/, "") + "/storage/v1/object/public/gallery-photos/")) {
      const filename = photo.image_url.split("/").pop()?.split("?")[0];
      if (filename && /^[a-zA-Z0-9.-]+$/.test(filename)) {
        try { await getGalleryStorage().storage.from("gallery-photos").remove([filename]); }
        catch { /* Record deletion remains available if object cleanup is unavailable. */ }
      }
    }

    await deleteGalleryPhoto(id);
    revalidateTag("ranch-public-content"); revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof RanchError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("Error deleting gallery photo:", error);
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}
