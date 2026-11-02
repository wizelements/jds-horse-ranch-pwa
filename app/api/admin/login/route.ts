import { NextRequest, NextResponse } from "next/server";
import { loginAdmin, adminConfigured, consumeLoginAttempt } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    if (!adminConfigured()) return NextResponse.json({ error: "Owner sign-in has not been configured yet." }, { status: 503 });
    const { password } = await req.json();

    if (typeof password !== "string" || !password || password.length > 256) {
      return NextResponse.json(
        { error: "Password required" },
        { status: 400 }
      );
    }

    const address = (req.headers.get(process.env.VERCEL ? "x-vercel-forwarded-for" : "x-forwarded-for") || "unknown").split(",")[0].trim();
    if (!(await consumeLoginAttempt(address))) {
      return NextResponse.json({ error: "Too many sign-in attempts. Try again in 15 minutes." }, { status: 429, headers: { "Retry-After": "900" } });
    }
    const success = await loginAdmin(password);

    if (!success) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true, message: "Logged in" });
  } catch (error) {
    console.error("Owner sign-in dependency unavailable");
    return NextResponse.json(
      { error: "Sign-in is temporarily unavailable. Please try again." },
      { status: 503 }
    );
  }
}
