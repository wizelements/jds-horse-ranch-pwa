import { NextRequest, NextResponse } from "next/server";
import { logContact } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    // Validate content type
    const contentType = req.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 400 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { type, source } = body;

    // Validate required fields
    if (!type || !["call", "email"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be 'call' or 'email'" },
        { status: 400 }
      );
    }

    if (!source) {
      return NextResponse.json(
        { error: "Source is required" },
        { status: 400 }
      );
    }

    const ipAddress = (req.headers.get("x-forwarded-for") || req.ip || "unknown")
      .split(",")[0]
      .trim();
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Log to Supabase
    await logContact({
      type: type as "call" | "email",
      source: String(source).substring(0, 500),
      userAgent,
      ipAddress,
    });

    console.log("Contact logged:", { type, source, ipAddress });

    // TODO: Send push notification to JD via Firebase
    // await sendPushToOwner({ type, source, ipAddress });

    return NextResponse.json(
      { success: true, message: "Contact logged successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact logging error:", error);
    return NextResponse.json(
      { error: "Failed to log contact", details: String(error) },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    { message: "Use POST to log contact" },
    { status: 405 }
  );
}
