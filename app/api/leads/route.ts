import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, phone, course, medium, mode, batchId } = body;
  if (!name || !String(name).trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });
  if (!phone || !/^[0-9]{10}$/.test(String(phone).trim())) return NextResponse.json({ error: "Valid 10-digit mobile required" }, { status: 400 });

  const entry = await prisma.lead.create({
    data: {
      id: `LEAD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      name: String(name).trim(),
      phone: String(phone).trim(),
      course: String(course || ""),
      medium: String(medium || ""),
      mode: String(mode || ""),
      batchId: batchId || null,
      status: "new",
    },
  });
  return NextResponse.json({ ok: true, id: entry.id });
}