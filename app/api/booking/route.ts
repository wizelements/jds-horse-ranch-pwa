import { NextResponse } from "next/server";

export const runtime = "nodejs";

// The ranch accepts reservations by telephone only. Keep this legacy route
// intentionally closed so old clients cannot submit unattended web inquiries.
export async function POST() {
  return NextResponse.json(
    { error: "Online booking requests are closed. Please call JD at (404) 981-2361 to discuss your ride.", phone: "+14049812361" },
    { status: 410, headers: { "Cache-Control": "no-store" } }
  );
}
