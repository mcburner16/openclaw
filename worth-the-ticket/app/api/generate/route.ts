import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateAllContent } from "@/lib/generate-content";
import type { Review } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { reviewId } = await req.json();
    if (!reviewId) {
      return NextResponse.json({ error: "reviewId required" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: review, error: reviewError } = await supabase
      .from("reviews")
      .select("*")
      .eq("id", reviewId)
      .single();

    if (reviewError || !review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const content = await generateAllContent(review as Review);

    // Upsert generated content
    const { data: existing } = await supabase
      .from("generated_content")
      .select("id")
      .eq("review_id", reviewId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("generated_content")
        .update(content)
        .eq("id", existing.id);
    } else {
      await supabase.from("generated_content").insert({ ...content, review_id: reviewId });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Generate error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
