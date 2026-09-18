import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { retrieve as retrieveKB, knowledgeBase, type KBChunk } from "@/data/knowledgeBase";

export async function POST(req: NextRequest) {
  const { query, lang = "en" } = await req.json();
  if (!query) return NextResponse.json({ error: "query required" }, { status: 400 });

  let kb: KBChunk[] = knowledgeBase;
  try {
    const dbChunks = await prisma.knowledgeChunk.findMany();
    if (dbChunks.length > 0) {
      kb = dbChunks.map((c) => ({
        id: c.id,
        category: c.category,
        keywords: c.keywords || [],
        en: c.en,
        hi: c.hi || c.en,
        te: c.te || c.en,
        source: c.source,
      }));
    }
  } catch {}
  const hits = retrieveKB(query as string, kb as any, 3) as any[];
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