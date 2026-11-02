import { revalidatePath, revalidateTag } from "next/cache";
import { RanchError } from "@/lib/errors";
import { servicePatch } from "@/lib/contentValidation";
import { NextRequest, NextResponse } from "next/server";
import { updateService } from "@/lib/turso";
import { verifyAdminSession } from "@/lib/auth";

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
    await updateService(id, servicePatch(body));
    revalidateTag("ranch-public-content"); revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof RanchError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("Error updating service:", error);
    return NextResponse.json(
      { error: "Failed to update service" },
      { status: 500 }
    );
  }
}
