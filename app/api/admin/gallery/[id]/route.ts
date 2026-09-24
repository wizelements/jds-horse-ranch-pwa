import { NextRequest, NextResponse } from "next/server";
import { updateGalleryPhoto } from "@/lib/supabase";
import { verifyAdminSession } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const isAuth = await verifyAdminSession();
    if (!isAuth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
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
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const isAuth = await verifyAdminSession();
    if (!isAuth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get photo to find filename
    const { data: photo, error: fetchError } = await getSupabaseAdmin()
      .from("gallery_photos")
      .select("image_url")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    // Extract filename from URL
    const filename = photo.image_url.split("/").pop();

    // Delete from storage
    if (filename) {
      await getSupabaseAdmin().storage.from("gallery-photos").remove([filename]);
    }

    // Delete from database
    const { error: deleteError } = await getSupabaseAdmin()
      .from("gallery_photos")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting gallery photo:", error);
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}
