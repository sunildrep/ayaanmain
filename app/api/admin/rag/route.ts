import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const isAdmin = req.cookies.get("ayaan_session")?.value;
  if (isAdmin) {
    const auth = await requireAdminSession(req, ["super_admin"]);
    if (auth.error) return auth.error;
  }
  const chunks = await prisma.knowledgeChunk.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(chunks);
}
export async function POST(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin"]);
  if (auth.error) return auth.error;
  const body = await req.json();
  let list: any[] = await prisma.knowledgeChunk.findMany();
  if (Array.isArray(body)) {
    await prisma.knowledgeChunk.deleteMany();
    await prisma.knowledgeChunk.createMany({ data: body.map((b: any) => ({ id: String(b.id || `kb-${Date.now()}`), category: String(b.category || "General"), keywords: Array.isArray(b.keywords) ? b.keywords.map((k: string) => String(k).toLowerCase()) : String(b.keywords || "").split(",").map((s: string) => s.trim().toLowerCase()).filter(Boolean), en: String(b.en || ""), hi: String(b.hi || ""), te: String(b.te || ""), source: String(b.source || "Admin") })) });
    list = await prisma.knowledgeChunk.findMany();
  } else {
    const chunk = { id: String(body.id || `kb-${Date.now()}`), category: String(body.category || "General"), keywords: Array.isArray(body.keywords) ? body.keywords.map((k: string) => String(k).toLowerCase()) : String(body.keywords || "").split(",").map((s: string) => s.trim().toLowerCase()).filter(Boolean), en: String(body.en || ""), hi: String(body.hi || ""), te: String(body.te || ""), source: String(body.source || "Admin") };
    if (!chunk.en && !chunk.hi && !chunk.te) return NextResponse.json({ error: "en/hi/te required" }, { status: 400 });
    await prisma.knowledgeChunk.upsert({ where: { id: chunk.id }, update: chunk, create: chunk });
    list = await prisma.knowledgeChunk.findMany();
  }
  return NextResponse.json({ ok: true, count: list.length });
}
export async function DELETE(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin"]);
  if (auth.error) return auth.error;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.knowledgeChunk.delete({ where: { id } });
  const list = await prisma.knowledgeChunk.findMany();
  return NextResponse.json({ ok: true, count: list.length });
}
