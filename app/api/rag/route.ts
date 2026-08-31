import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function retrieve(query: string, topK: number) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return prisma.knowledgeChunk.findMany().then((chunks) => {
    const scored = chunks.map((chunk) => {
      const kw = chunk.keywords || [];
      let score = 0;
      for (const t of terms) if (kw.includes(t)) score++;
      if (score === 0) {
        const hay = (chunk.en + " " + (chunk.hi || "") + " " + (chunk.te || "")).toLowerCase();
        for (const t of terms) if (hay.includes(t)) score += 0.5;
      }
      return { ...chunk, score };
    });
    return scored.filter((c) => c.score > 0).sort((a, b) => b.score - a.score).slice(0, topK);
  });
}

export async function POST(req: NextRequest) {
  const { query, lang = "en" } = await req.json();
  if (!query) return NextResponse.json({ error: "query required" }, { status: 400 });

  const hits = await retrieve(query, 3);
  const l = (["en", "hi", "te"].includes(lang) ? lang : "en") as "en" | "hi" | "te";
  const answer = hits.length
    ? hits.map((h) => (l === "hi" ? h.hi : l === "te" ? h.te : h.en)).join(" ")
    : null;
  const sources = hits.map((h) => ({ id: h.id, category: h.category, source: h.source }));

  return NextResponse.json({
    lang: l,
    query,
    answer: answer ?? (l === "hi" ? "जानकारी नहीं मिली। +91 8886667222 पर संपर्क करें।" : l === "te" ? "సమాచారం దొరకలేదు. +91 8886667222కు కాల్ చేయండి." : "No grounded answer found. Please contact +91 8886667222."),
    sources,
    grounded: hits.length > 0,
  });
}