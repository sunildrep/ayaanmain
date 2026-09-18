import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";

// POST /api/admin/users/reset-password — super_admin resets another admin's password
export async function POST(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin"]);
  if (auth.error) return auth.error;
  const body = await req.json().catch(() => ({}));
  const id = String(body.id || "").trim();
  const newPassword = String(body.newPassword || body.password || "");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  if (!newPassword || newPassword.length < 8) return NextResponse.json({ error: "New password min 6 chars" }, { status: 400 });

  const admin = await prisma.admin.findUnique({ where: { id } });
  if (!admin) return NextResponse.json({ error: "Admin not found" }, { status: 404 });
  if (!admin.supabaseId) return NextResponse.json({ error: "Admin not linked to auth — contact support" }, { status: 400 });

  const { error } = await supabaseAdmin.auth.admin.updateUserById(admin.supabaseId, { password: newPassword });
  if (error) return NextResponse.json({ error: `Reset failed: ${error.message}` }, { status: 400 });

  await prisma.admin.update({ where: { id }, data: { mustChangePassword: true } });
  // Invalidate all sessions for that admin
  await prisma.session.deleteMany({ where: { OR: [{ userId: id }, { username: admin.username }] } });

  return NextResponse.json({ ok: true, message: "Password reset — user must change on next login" });
}
