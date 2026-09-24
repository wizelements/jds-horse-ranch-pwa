import { NextRequest, NextResponse } from "next/server";
import { updateTestimonial } from "@/lib/supabase";
import { verifyAdminSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

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
    await updateTestimonial(id, body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating testimonial:", error);
    return NextResponse.json(
      { error: "Failed to update testimonial" },
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

    const { error } = await supabase
      .from("testimonials")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    return NextResponse.json(
      { error: "Failed to delete testimonial" },
      { status: 500 }
    );
  }
}
