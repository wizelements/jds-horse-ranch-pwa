import { NextRequest, NextResponse } from "next/server";
import { updateService } from "@/lib/supabase";
import { verifyAdminSession } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAuth = await verifyAdminSession();
    if (!isAuth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    await updateService(params.id, body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json(
      { error: "Failed to update service" },
      { status: 500 }
    );
  }
}
