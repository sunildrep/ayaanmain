import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const SESSION_EXPIRY_DAYS = 7;

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  const admin = await prisma.admin.findUnique({ where: { username } });
  if (admin && admin.passwordHash && bcrypt.compareSync(password, admin.passwordHash)) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    await prisma.session.create({
      data: { token, userId: admin.username, role: admin.role, username: admin.username, name: admin.name, expiresAt },
    });
    const res = NextResponse.json({ ok: true, role: admin.role, name: admin.name });
    res.cookies.set("ayaan_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * SESSION_EXPIRY_DAYS,
    });
    return res;
  }
  return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
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
  if (!token) return NextResponse.json({ authenticated: false });
  const session = await prisma.session.findUnique({ where: { token } });
  if (!session || session.expiresAt < new Date()) {
    if (session) await prisma.session.delete({ where: { token } });
    return NextResponse.json({ authenticated: false });
  }
  return NextResponse.json({ authenticated: true, role: session.role, user: session.username });
}
