import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

// Secured layer: only allow sunil@drep.in for now (as per request)
const ALLOWED_ADMIN_EMAIL = "sunil@drep.in";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const cleanEmail = String(email || "").trim().toLowerCase();

  if (!cleanEmail || !cleanEmail.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  // Secured layer: restrict to allowed email for now
  if (cleanEmail !== ALLOWED_ADMIN_EMAIL) {
    return NextResponse.json({ error: `OTP login currently restricted to ${ALLOWED_ADMIN_EMAIL}` }, { status: 403 });
  }

  // Check if admin exists in Prisma
  const admin = await prisma.admin.findUnique({ where: { email: cleanEmail } });
  if (!admin) {
    return NextResponse.json({ error: "Admin not found" }, { status: 404 });
  }

  // Send OTP via Supabase Auth
  const { error } = await supabase.auth.signInWithOtp({
    email: cleanEmail,
    options: { shouldCreateUser: false },
  });

  if (error) {
    // Fallback: generate recovery link
    const { error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: cleanEmail,
    });
    if (linkError) {
      return NextResponse.json({ error: `Failed to send OTP: ${error.message}` }, { status: 400 });
    }
    return NextResponse.json({ ok: true, message: "OTP sent via recovery (check email)" });
  }

  return NextResponse.json({ ok: true, message: `OTP sent to ${cleanEmail} (check inbox/spam, valid 1 hour)` });
}
