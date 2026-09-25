import { NextRequest, NextResponse } from "next/server";
import {
  createTestimonial,
  getTestimonials,
} from "@/lib/turso";
import { verifyAdminSession } from "@/lib/auth";

export async function GET() {
  try {
    if (!(await verifyAdminSession())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const testimonials = await getTestimonials();
    return NextResponse.json({ testimonials });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await verifyAdminSession())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const customerName = String(body.customer_name || "").trim().slice(0, 255);
    const text = String(body.text || "").trim().slice(0, 4000);
    const rating = Math.min(5, Math.max(1, Number(body.rating || 5)));

    if (!customerName || !text) {
      return NextResponse.json(
        { error: "Name and text required" },
        { status: 400 }
      );
    }

    const testimonial = await createTestimonial({
      customer_name: customerName,
      text,
      rating,
    });

    return NextResponse.json({ testimonial }, { status: 201 });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json(
      { error: "Failed to create testimonial" },
      { status: 500 }
    );
  }
}
