import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabase, supabaseAdmin, usernameToEmail } from "@/lib/supabase";
import crypto from "crypto";

const SESSION_EXPIRY_DAYS = 7;

export async function POST(req: NextRequest) {
  const { username, email, password } = await req.json();
  const raw = String(username || email || "").trim();
  if (!raw || !password) return NextResponse.json({ ok: false, error: "Email/username and password required" }, { status: 400 });

  const emailToCheck = usernameToEmail(raw);

  // Authenticate via Supabase Auth only - no hardcoded fallback
  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailToCheck,
    password: String(password),
  });

  if (error || !data.user) {
    // Try to get more specific error from Supabase
    return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
  }

  // Lookup admin role from Prisma via email or supabaseId
  let admin = await prisma.admin.findUnique({ where: { email: emailToCheck } });
  if (!admin) {
    // Try by supabaseId
    admin = await prisma.admin.findFirst({ where: { supabaseId: data.user.id } });
  }
  if (!admin) {
    // Not an admin - check if user exists but is not admin
    return NextResponse.json({ ok: false, error: "Not an admin account" }, { status: 403 });
  }

  // Ensure supabaseId is linked
  if (!admin.supabaseId) {
    await prisma.admin.update({ where: { id: admin.id }, data: { supabaseId: data.user.id } });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  await prisma.session.create({
    data: { token, userId: admin.username, role: admin.role, username: admin.username, name: admin.name, expiresAt },
  });

  // Also sign out the temporary Supabase session (we use our own session cookie)
  await supabase.auth.signOut();

  const res = NextResponse.json({ ok: true, role: admin.role, name: admin.name, email: admin.email });
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
  if (!token) return NextResponse.json({ authenticated: false });
  const session = await prisma.session.findUnique({ where: { token } });
  if (!session || session.expiresAt < new Date()) {
    if (session) await prisma.session.delete({ where: { token } });
    return NextResponse.json({ authenticated: false });
  }
  return NextResponse.json({ authenticated: true, role: session.role, user: session.username });
}
