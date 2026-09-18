import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { hashToken } from "@/lib/auth-helpers";

// POST /api/admin/change-password — admin changes own password (used for forced first-login)
export async function POST(req: NextRequest) {
  const token = req.cookies.get("ayaan_session")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const hashed = hashToken(token);
  let session: any = await prisma.session.findUnique({ where: { token: hashed } });
  if (!session) session = await prisma.session.findUnique({ where: { token } });
  if (!session || session.expiresAt < new Date() || session.role === "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Find admin by session userId or username
  let admin: any = await prisma.admin.findFirst({
    where: { OR: [{ id: session.userId }, { username: session.username }, { email: session.username }] },
  });
  if (!admin && session.username && session.username.includes("@")) {
    admin = await prisma.admin.findUnique({ where: { email: session.username.toLowerCase() } });
  }
  if (!admin) return NextResponse.json({ error: "Admin not found" }, { status: 404 });
  if (!admin.supabaseId) return NextResponse.json({ error: "Account not linked — contact super admin" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const oldPassword = String(body.oldPassword || "");
  const newPassword = String(body.newPassword || "");
  if (!oldPassword || !newPassword) return NextResponse.json({ error: "Old and new password required" }, { status: 400 });
  if (newPassword.length < 8) return NextResponse.json({ error: "New password min 6 chars" }, { status: 400 });
  if (oldPassword === newPassword) return NextResponse.json({ error: "New password must differ" }, { status: 400 });

  // Verify old password via Supabase signIn
  const { error: signError } = await supabase.auth.signInWithPassword({ email: admin.email, password: oldPassword });
  if (signError) return NextResponse.json({ error: "Old password is incorrect" }, { status: 400 });
  await supabase.auth.signOut();

  const { error: upError } = await supabaseAdmin.auth.admin.updateUserById(admin.supabaseId, { password: newPassword });
  if (upError) return NextResponse.json({ error: `Update failed: ${upError.message}` }, { status: 400 });

  await prisma.admin.update({ where: { id: admin.id }, data: { mustChangePassword: false } });

  return NextResponse.json({ ok: true });
}
