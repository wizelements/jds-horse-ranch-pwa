import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";
import { createGalleryPhoto } from "@/lib/turso";
import { getGalleryStorage } from "@/lib/storage";
import sharp from "sharp";
import { revalidatePath, revalidateTag } from "next/cache";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function POST(req: NextRequest) {
  try {
    if (!(await verifyAdminSession())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const title = String(formData.get("title") || "Untitled").trim().slice(0, 255);

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, WEBP, or GIF images are allowed" },
        { status: 400 }
      );
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: "Image must be 8 MB or smaller" },
        { status: 400 }
      );
    }
    if (!process.env.SUPABASE_STORAGE_URL || !process.env.SUPABASE_STORAGE_SERVICE_ROLE_KEY) return NextResponse.json({ error: "Photo storage is not configured yet. Existing ranch photos remain available." }, { status: 503 });
    let optimized: Buffer;
    try {
      optimized = await sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 40000000 }).rotate().resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
    } catch { return NextResponse.json({ error: "This file could not be read as a supported photograph." }, { status: 400 }); }
    const filename = `${Date.now()}-${randomUUID()}.webp`;

    const storage = getGalleryStorage();
    const { error: uploadError } = await storage.storage
      .from("gallery-photos")
      .upload(filename, optimized, {
        contentType: "image/webp",
        upsert: false,
        cacheControl: "31536000",
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = storage.storage
      .from("gallery-photos")
      .getPublicUrl(filename);

    try {
      const photo = await createGalleryPhoto({
        title,
        image_url: urlData.publicUrl,
      });
      revalidateTag("ranch-public-content"); revalidatePath("/");
      return NextResponse.json({ photo }, { status: 201 });
    } catch (error) {
      await storage.storage.from("gallery-photos").remove([filename]);
      throw error;
    }
  } catch (error) {
    console.error("Error uploading photo:", error);
    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    );
  }
}
