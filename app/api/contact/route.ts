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
    const { type, source } = await req.json();

    const log: ContactLog = {
      timestamp: new Date().toISOString(),
      type,
      source,
      userAgent: req.headers.get("user-agent") || "unknown",
      ip: req.headers.get("x-forwarded-for") || req.ip || "unknown",
    };

    contactLogs.push(log);
    console.log("Contact logged:", log);

    // TODO: Send push notification to JD via Firebase
    // await sendPushToOwner(log);

    return NextResponse.json({ success: true, log }, { status: 201 });
  } catch (error) {
    console.error("Contact logging error:", error);
    return NextResponse.json(
      { error: "Failed to log contact" },
      { status: 500 }
    );
  }
}

export async function GET() {
  // For development: view recent contacts
  return NextResponse.json({
    total: contactLogs.length,
    recent: contactLogs.slice(-10),
  });
}
