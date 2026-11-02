import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";
import { handleReservationAction } from "@/lib/bookingService";
import { RanchError } from "@/lib/errors";

export const runtime = "nodejs";
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!(await verifyAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await context.params;
    return NextResponse.json(await handleReservationAction(id, await req.json()));
  } catch (error) {
    if (error instanceof RanchError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    console.error("Reservation action dependency unavailable");
    return NextResponse.json({ error: "This action could not be completed. Refresh the reservation before trying again." }, { status: 503 });
  }
}
