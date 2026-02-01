import { NextRequest, NextResponse } from "next/server";

interface ContactLog {
  timestamp: string;
  type: "call" | "email";
  source: string;
  userAgent: string;
  ip: string;
}

// Simple in-memory log (replace with database in production)
const contactLogs: ContactLog[] = [];

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

    const log: ContactLog = {
      timestamp: new Date().toISOString(),
      type: type as "call" | "email",
      source: String(source).substring(0, 500), // Limit to 500 chars
      userAgent: req.headers.get("user-agent") || "unknown",
      ip: (req.headers.get("x-forwarded-for") || req.ip || "unknown").split(",")[0].trim(),
    };

    contactLogs.push(log);
    console.log("Contact logged:", log);

    // TODO: Send push notification to JD via Firebase
    // await sendPushToOwner(log);

    return NextResponse.json({ success: true, log }, { status: 201 });
  } catch (error) {
    console.error("Contact logging error:", error);
    return NextResponse.json(
      { error: "Failed to log contact", details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  // For development: view recent contacts
  return NextResponse.json(
    {
      total: contactLogs.length,
      recent: contactLogs.slice(-10),
      note: "In-memory storage. Persists only during deployment. Use database for permanent storage.",
    },
    { headers: { "Cache-Control": "no-cache" } }
  );
}

export async function OPTIONS() {
  return NextResponse.json(
    { message: "Use POST to log contact, GET to view logs" },
    { status: 405 }
  );
}
