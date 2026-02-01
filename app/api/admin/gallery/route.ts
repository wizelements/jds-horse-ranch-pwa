import { NextRequest, NextResponse } from "next/server";
import { getGalleryPhotos } from "@/lib/supabase";
import { verifyAdminSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const isAuth = await verifyAdminSession();
    if (!isAuth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const photos = await getGalleryPhotos();
    return NextResponse.json({ photos });
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery" },
      { status: 500 }
    );
  }
}
