import { NextRequest, NextResponse } from "next/server";
import { retrieve, type Lang } from "@/data/knowledgeBase";

export async function POST(req: NextRequest) {
  const { query, lang = "en" } = await req.json();
  if (!query) return NextResponse.json({ error: "query required" }, { status: 400 });

  const hits = retrieve(query, 3);
  const l = (["en", "hi", "te"].includes(lang) ? lang : "en") as Lang;
  const answer = hits.length
    ? hits.map((h) => (l === "hi" ? h.hi : l === "te" ? h.te : h.en)).join(" ")
    : null;
  const sources = hits.map((h) => ({ id: h.id, category: h.category, source: h.source }));

  // In production, replace this with real LLM generation (OpenAI/Anthropic) using hits as context.
  return NextResponse.json({
    lang: l,
    query,
    answer: answer ?? (l === "hi" ? "जानकारी नहीं मिली। +91 8886667222 पर संपर्क करें।" : l === "te" ? "సమాచారం దొరకలేదు. +91 8886667222కు కాల్ చేయండి." : "No grounded answer found. Please contact +91 8886667222."),
    sources,
    grounded: hits.length > 0,
  });
}
