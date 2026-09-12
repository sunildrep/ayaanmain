import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabase, supabaseAdmin } from "@/lib/supabase";

// Student changes own password (used for mandatory first-login change).
// Verifies old password via Supabase, updates, clears mustChangePassword.
export async function POST(req: NextRequest) {
  const token = req.cookies.get("ayaan_session")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const session = await prisma.session.findUnique({ where: { token } });
  if (!session || session.expiresAt < new Date() || session.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  const body = await req.json();
  const oldPassword = String(body.oldPassword || "");
  const newPassword = String(body.newPassword || "");
  if (!oldPassword || !newPassword) return NextResponse.json({ error: "Old and new password required" }, { status: 400 });
  if (newPassword.length < 6) return NextResponse.json({ error: "New password min 6 chars" }, { status: 400 });
  if (oldPassword === newPassword) return NextResponse.json({ error: "New password must differ" }, { status: 400 });

  const { error: signError } = await supabase.auth.signInWithPassword({ email: user.email, password: oldPassword });
  if (signError) {
    return NextResponse.json({ error: "Old password is incorrect" }, { status: 400 });
  }
  await supabase.auth.signOut();

  if (!user.supabaseId) return NextResponse.json({ error: "Account not linked — contact admin" }, { status: 400 });
  const { error: upError } = await supabaseAdmin.auth.admin.updateUserById(user.supabaseId, { password: newPassword });
  if (upError) return NextResponse.json({ error: `Update failed: ${upError.message}` }, { status: 400 });

  await prisma.user.update({ where: { id: user.id }, data: { mustChangePassword: false } });
  return NextResponse.json({ ok: true });
}
