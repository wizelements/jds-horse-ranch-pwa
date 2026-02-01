import { NextRequest, NextResponse } from "next/server";
import { getServices } from "@/lib/supabase";
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

    const services = await getServices();
    return NextResponse.json({ services });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}
