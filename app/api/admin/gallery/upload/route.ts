import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";
import { createGalleryPhoto } from "@/lib/turso";
import { getGalleryStorage } from "@/lib/storage";

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

    const extension =
      file.type === "image/jpeg"
        ? "jpg"
        : file.type.split("/")[1].replace("jpeg", "jpg");
    const filename = `${Date.now()}-${randomUUID()}.${extension}`;

    const storage = getGalleryStorage();
    const { error: uploadError } = await storage.storage
      .from("gallery-photos")
      .upload(filename, file, {
        contentType: file.type,
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
