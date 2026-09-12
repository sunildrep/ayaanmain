import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { email, token, newPassword, otp } = await req.json();
  const cleanEmail = String(email || "").trim().toLowerCase();
  const code = String(token || otp || "").trim();
  const pw = String(newPassword || "").trim();

  if (!cleanEmail || !code) return NextResponse.json({ error: "Email and OTP required" }, { status: 400 });
  if (!pw || pw.length < 6) return NextResponse.json({ error: "New password min 6 chars required" }, { status: 400 });

  // Verify OTP via Supabase
  const { data, error } = await supabase.auth.verifyOtp({
    email: cleanEmail,
    token: code,
    type: "email", // signInWithOtp uses type 'email'
  });

  // Fallback: try recovery type if email type fails
  let userId = data?.user?.id;
  let verifyError = error;
  if (error || !userId) {
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

  // Update password via admin (requires service role)
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: pw,
  });

  if (updateError) {
    return NextResponse.json({ error: `Failed to update password: ${updateError.message}` }, { status: 400 });
  }

  // Also update prisma if needed (for linking, but password is Supabase-only now)
  // Ensure supabaseId is linked
  const admin = await prisma.admin.findUnique({ where: { email: cleanEmail } });
  if (admin && !admin.supabaseId) {
    await prisma.admin.update({ where: { id: admin.id }, data: { supabaseId: userId } });
  }
  const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (user && !user.supabaseId) {
    await prisma.user.update({ where: { id: user.id }, data: { supabaseId: userId } });
  }

  // Sign out the temporary session
  await supabase.auth.signOut();

  return NextResponse.json({ ok: true, message: "Password reset successful — you can now login" });
}
