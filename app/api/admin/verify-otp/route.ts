import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const SESSION_EXPIRY_DAYS = 7;
const ALLOWED_ADMIN_EMAIL = "sunil@drep.in";

export async function POST(req: NextRequest) {
  const { email, token, otp } = await req.json();
  const cleanEmail = String(email || "").trim().toLowerCase();
  const code = String(token || otp || "").trim();

  if (!cleanEmail || !code) {
    return NextResponse.json({ error: "Email and OTP required" }, { status: 400 });
  }

  if (cleanEmail !== ALLOWED_ADMIN_EMAIL) {
    return NextResponse.json({ error: `OTP login restricted to ${ALLOWED_ADMIN_EMAIL}` }, { status: 403 });
  }

  // Verify OTP via Supabase - try email type first, then recovery
  let userId: string | null = null;
  let verifyError: any = null;

  const { data, error } = await supabase.auth.verifyOtp({
    email: cleanEmail,
    token: code,
    type: "email",
  });

  if (!error && data.user) {
    userId = data.user.id;
  } else {
    verifyError = error;
    const { data: data2, error: err2 } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: code,
      type: "recovery",
    });
    if (!err2 && data2.user) {
      userId = data2.user.id;
      verifyError = null;
    } else {
      verifyError = err2 || error;
    }
  }

  if (verifyError || !userId) {
    return NextResponse.json({ error: `Invalid or expired OTP: ${verifyError?.message || "verify failed"}` }, { status: 400 });
  }

  // Lookup admin by email or supabaseId
  let admin = await prisma.admin.findUnique({ where: { email: cleanEmail } });
  if (!admin) {
    admin = await prisma.admin.findFirst({ where: { supabaseId: userId } });
  }
  if (!admin) {
    return NextResponse.json({ error: "Admin not found" }, { status: 404 });
  }

  // Link supabaseId if missing
  if (!admin.supabaseId) {
    await prisma.admin.update({ where: { id: admin.id }, data: { supabaseId: userId } });
  }

  // Create secured session (httpOnly, secure, sameSite strict)
  const tokenStr = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  await prisma.session.create({
    data: { token: tokenStr, userId: admin.username, role: admin.role, username: admin.username, name: admin.name, expiresAt },
  });

  // Sign out temp Supabase session
  await supabase.auth.signOut();

  const res = NextResponse.json({ ok: true, role: admin.role, name: admin.name, email: admin.email });
  res.cookies.set("ayaan_session", tokenStr, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * SESSION_EXPIRY_DAYS,
  });
  return res;
}
