import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const isAuth = await verifyAdminSession();
    if (!isAuth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const title = (formData.get("title") as string) || "Untitled";

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const ext = file.name.split(".").pop();
    const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from("gallery-photos")
      .upload(filename, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("gallery-photos")
      .getPublicUrl(filename);

    // Save metadata to database
    const { data: photoData, error: dbError } = await supabase
      .from("gallery_photos")
      .insert([
        {
          title,
          image_url: urlData.publicUrl,
          display_order: 0,
          active: true,
        },
      ])
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({ photo: photoData }, { status: 201 });
  } catch (error) {
    console.error("Error uploading photo:", error);
    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    );
  }
}
