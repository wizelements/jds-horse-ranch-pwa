import { NextRequest, NextResponse } from "next/server";
import { getTestimonials } from "@/lib/supabase";
import { verifyAdminSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const isAuth = await verifyAdminSession();
    if (!isAuth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
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
    const isAuth = await verifyAdminSession();
    if (!isAuth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { customer_name, text, rating } = body;

    if (!customer_name || !text) {
      return NextResponse.json(
        { error: "Name and text required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("testimonials")
      .insert([
        {
          customer_name,
          text,
          rating: rating || 5,
          display_order: 0,
          active: true,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ testimonial: data }, { status: 201 });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json(
      { error: "Failed to create testimonial" },
      { status: 500 }
    );
  }
}
