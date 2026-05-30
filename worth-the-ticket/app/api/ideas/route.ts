import { NextRequest, NextResponse } from "next/server";
import { generatePostIdeas } from "@/lib/generate-content";

export async function POST(req: NextRequest) {
  try {
    const { category } = await req.json();
    if (!category) {
      return NextResponse.json({ error: "category required" }, { status: 400 });
    }

    const ideas = await generatePostIdeas(category);
    return NextResponse.json({ ideas });
  } catch (err) {
    console.error("Ideas error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
