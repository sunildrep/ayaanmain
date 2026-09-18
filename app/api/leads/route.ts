import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitizeText, isPhone } from "@/lib/validators";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { audit } from "@/lib/identifiers";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = rateLimit(`leads:${ip}`, 10, 15 * 60 * 1000);
  if (!rl.allowed) return NextResponse.json({ error: "Too many enquiries — try again later" }, { status: 429 });
  const body = await req.json();
  if (body.website || body.honeypot) return NextResponse.json({ ok: true, id: "HP-" + Date.now() });
  const { name, phone, course, medium, mode, batchId } = body;
  if (!name || !String(name).trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });
  if (!phone || !isPhone(String(phone))) return NextResponse.json({ error: "Valid 10-digit mobile required" }, { status: 400 });

  const entry = await prisma.lead.create({
    data: {
      id: `LEAD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      name: sanitizeText(String(name), 100),
      phone: String(phone).trim(),
      course: sanitizeText(String(course || ""), 50),
      medium: sanitizeText(String(medium || ""), 20),
      mode: sanitizeText(String(mode || ""), 20),
      batchId: batchId || null,
      status: "new",
    },
  });
  await audit("lead", entry.id, `public:${String(phone).trim()}`, "created", `Lead via public form course:${course || "-"}`);
  return NextResponse.json({ ok: true, id: entry.id });
}