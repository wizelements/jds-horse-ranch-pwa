import { revalidatePath, revalidateTag } from "next/cache";
import { RanchError } from "@/lib/errors";
import { publicContentPatch } from "@/lib/contentValidation";
import { NextRequest, NextResponse } from "next/server";
import {
  deleteTestimonial,
  updateTestimonial,
} from "@/lib/turso";
import { verifyAdminSession } from "@/lib/auth";

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
    await updateTestimonial(id, publicContentPatch(body, "review"));
    revalidateTag("ranch-public-content"); revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof RanchError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("Error updating testimonial:", error);
    return NextResponse.json(
      { error: "Failed to update testimonial" },
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

    await deleteTestimonial(id);
    revalidateTag("ranch-public-content"); revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof RanchError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("Error deleting testimonial:", error);
    return NextResponse.json(
      { error: "Failed to delete testimonial" },
      { status: 500 }
    );
  }
}
