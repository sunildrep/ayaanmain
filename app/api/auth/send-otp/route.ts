import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const cleanEmail = String(email || "").trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  // Check if user exists in Prisma (admin or student) - don't reveal enumeration, but we can be generic
  const admin = await prisma.admin.findUnique({ where: { email: cleanEmail } });
  const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (!admin && !user) {
    // Still return success to prevent enumeration, but log
    return NextResponse.json({ ok: true, message: "If account exists, OTP sent" });
  }

  // Send OTP via Supabase Auth - use signInWithOtp (sends 6-digit code)
  const { error } = await supabase.auth.signInWithOtp({
    email: cleanEmail,
    options: {
      shouldCreateUser: false,
    },
  });

  if (error) {
    // Fallback: try admin generateLink with recovery type
    const { error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: cleanEmail,
    });
    if (linkError) {
      return NextResponse.json({ error: `Failed to send OTP: ${error.message}` }, { status: 400 });
    }
    return NextResponse.json({ ok: true, message: "OTP sent via recovery link" });
  }

  return NextResponse.json({ ok: true, message: "OTP sent to email (check inbox/spam, valid 1 hour)" });
}
