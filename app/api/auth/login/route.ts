import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const SESSION_EXPIRY_DAYS = 7;

export async function POST(req: NextRequest) {
  const { email, phone, password } = await req.json();
  const identifier = (email || phone || "").toString().trim().toLowerCase();
  if (!identifier || !password) return NextResponse.json({ error: "email/phone and password required" }, { status: 400 });

  const user = await prisma.user.findFirst({ where: { OR: [{ email: identifier }, { phone: identifier }] } });
  if (!user || !user.passwordHash || !bcrypt.compareSync(String(password), user.passwordHash)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  if (!user.isActive) return NextResponse.json({ error: "Account deactivated" }, { status: 403 });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { token, userId: user.id, role: "student", username: user.email, name: user.name, expiresAt } });

  const res = NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, course: user.course } });
  res.cookies.set("ayaan_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * SESSION_EXPIRY_DAYS,
  });
  return res;
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get("ayaan_session")?.value;
  if (token) await prisma.session.deleteMany({ where: { token } });
  const res = NextResponse.json({ ok: true });
  res.cookies.set("ayaan_session", "", { path: "/", maxAge: 0 });
  return res;
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get("ayaan_session")?.value;
  if (!token) return NextResponse.json({ authenticated: false }, { headers: { "Cache-Control": "no-store" } });
  const session = await prisma.session.findUnique({ where: { token } });
  if (!session || session.expiresAt < new Date() || session.role !== "student") {
    if (session) await prisma.session.delete({ where: { token } });
    return NextResponse.json({ authenticated: false }, { headers: { "Cache-Control": "no-store" } });
  }
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return NextResponse.json({ authenticated: false }, { headers: { "Cache-Control": "no-store" } });
  return NextResponse.json({ authenticated: true, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, course: user.course } }, { headers: { "Cache-Control": "no-store" } });
}