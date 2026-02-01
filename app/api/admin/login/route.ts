import { NextRequest, NextResponse } from "next/server";
import { loginAdmin, hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json(
        { error: "Password required" },
        { status: 400 }
      );
    }

    const success = await loginAdmin(password);

    if (!success) {
      // Delay response to prevent brute force
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true, message: "Logged in" });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
