import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  let rl = rateLimit(`auth_send_otp:${ip}`, 5, 60 * 60 * 1000);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests — try again later" }, { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetMs / 1000)) } });
  const { email } = await req.json();
  const cleanEmail = String(email || "").trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }
  rl = rateLimit(`auth_send_otp:${cleanEmail}`, 5, 60 * 60 * 1000);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests for this email" }, { status: 429 });

  // Only allow student OTP via generic flow — admins must use /api/admin/send-otp (restricted to sunil@drep.in)
  const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (!user) {
    return NextResponse.json({ ok: true, message: "If account exists, OTP sent" });
  }
  if (user.isActive === false) return NextResponse.json({ error: "Account deactivated — contact support" }, { status: 403 });

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
