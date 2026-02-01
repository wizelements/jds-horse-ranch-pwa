import { NextRequest, NextResponse } from "next/server";
import { getContacts } from "@/lib/supabase";
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

    const contacts = await getContacts(500);
    return NextResponse.json({ contacts });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}
