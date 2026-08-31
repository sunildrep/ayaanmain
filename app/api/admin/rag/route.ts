import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "knowledgeBase.json");

// fallback: if file missing, seed from TS
function read() {
  try {
    if (fs.existsSync(filePath)) return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {}
  // seed from knowledgeBase.ts via dynamic import fallback
  try {
    const seedPath = path.join(process.cwd(), "data", "rag.json");
    if (fs.existsSync(seedPath)) return JSON.parse(fs.readFileSync(seedPath, "utf-8"));
  } catch {}
  return null;
}

export async function GET() {
  const data = read();
  if (!data) {
    // import TS file
    const { knowledgeBase } = await import("@/data/knowledgeBase");
    return NextResponse.json(knowledgeBase);
  }
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (req.cookies.get("ayaan_admin")?.value !== "1") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  // body can be single chunk or array
  let list: any[] = read() || [];
  if (!list) {
    const { knowledgeBase } = await import("@/data/knowledgeBase");
    list = [...knowledgeBase];
  }
  if (Array.isArray(body)) {
    // replace all
    list = body;
  } else {
    const chunk = {
      id: String(body.id || `kb-${Date.now()}`),
      category: String(body.category || "General"),
      keywords: Array.isArray(body.keywords) ? body.keywords.map((k: string) => String(k).toLowerCase()) : String(body.keywords || "").split(",").map((s: string) => s.trim().toLowerCase()).filter(Boolean),
      en: String(body.en || ""),
      hi: String(body.hi || ""),
      te: String(body.te || ""),
      source: String(body.source || "Admin"),
    };
    if (!chunk.en && !chunk.hi && !chunk.te) return NextResponse.json({ error: "en/hi/te required" }, { status: 400 });
    const idx = list.findIndex((x: any) => x.id === chunk.id);
    if (idx >= 0) list[idx] = chunk;
    else list.unshift(chunk);
  }
  fs.writeFileSync(filePath, JSON.stringify(list, null, 2));
  return NextResponse.json({ ok: true, count: list.length });
}

export async function DELETE(req: NextRequest) {
  if (req.cookies.get("ayaan_admin")?.value !== "1") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  let list: any[] = read() || [];
  if (!list) {
    const { knowledgeBase } = await import("@/data/knowledgeBase");
    list = [...knowledgeBase];
  }
  const next = list.filter((x: any) => x.id !== id);
  fs.writeFileSync(filePath, JSON.stringify(next, null, 2));
  return NextResponse.json({ ok: true, count: next.length });
}
