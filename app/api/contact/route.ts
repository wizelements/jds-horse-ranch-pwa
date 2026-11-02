import { NextRequest, NextResponse } from "next/server";
import { logContact } from "@/lib/turso";

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

    const origin = req.headers.get("origin");
    if ((origin && origin !== new URL(req.url).origin) || req.headers.get("sec-fetch-site") === "cross-site") return NextResponse.json({ error: "Invalid origin" }, { status: 403 });

    // Log to Turso
    await logContact({
      type: type as "call" | "email",
      source: String(source).substring(0, 500),

    });





    return NextResponse.json(
      { success: true, message: "Contact logged successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact activity storage unavailable");
    return NextResponse.json(
      { error: "Contact activity unavailable" },
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
