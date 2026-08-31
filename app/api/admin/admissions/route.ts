import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireAdminSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin", "admissions"]);
  if (auth.error) return auth.error;
  const admissions = await prisma.admission.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(admissions, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin", "admissions"]);
  if (auth.error) return auth.error;
  const body = await req.json();
  const { action, id, password } = body;
  if (!action || !id) return NextResponse.json({ error: "action and id required" }, { status: 400 });

  const admission = await prisma.admission.findUnique({ where: { id } });
  if (!admission) return NextResponse.json({ error: "Admission not found" }, { status: 404 });

  if (action === "approve") {
    if (admission.status === "approved") return NextResponse.json({ error: "Already approved" }, { status: 400 });
    const existing = await prisma.user.findUnique({ where: { email: admission.email } });
    if (existing) return NextResponse.json({ error: "User already exists for this email" }, { status: 400 });
    const pw = String(password || "").trim();
    if (!pw || pw.length < 6) return NextResponse.json({ error: "Password required (min 6 chars) to create account" }, { status: 400 });
    const user = await prisma.user.create({
      data: {
        name: admission.name,
        fatherName: admission.fatherName,
        phone: admission.phone,
        email: admission.email,
        address: admission.address,
        reference: admission.reference,
        branch: admission.branch,
        course: admission.course,
        courseType: admission.courseType,
        medium: admission.medium,
        mode: admission.mode,
        passwordHash: bcrypt.hashSync(pw, 10),
        admissionId: id,
        isActive: true,
      },
    });
    await prisma.admission.update({ where: { id }, data: { status: "approved", approvedAt: new Date() } });
    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } });
  }

  if (action === "reject") {
    await prisma.admission.update({ where: { id }, data: { status: "rejected", rejectedAt: new Date() } });
    return NextResponse.json({ ok: true });
  }

  if (action === "pending") {
    await prisma.admission.update({ where: { id }, data: { status: "pending" } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
