import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/auth-helpers";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("ayaan_session")?.value;
  if (token) {
    // Sessions are stored hashed — delete hashed first, then legacy plaintext
    try { await prisma.session.deleteMany({ where: { token: hashToken(token) } }); } catch {}
    try { await prisma.session.deleteMany({ where: { token } }); } catch {}
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("ayaan_session", "", { path: "/", maxAge: 0 });
  return res;
}