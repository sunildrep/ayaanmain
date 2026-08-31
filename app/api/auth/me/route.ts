import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("ayaan_session")?.value;
  if (!token) return NextResponse.json({ authenticated: false }, { headers: { "Cache-Control": "no-store" } });
  const session = await prisma.session.findUnique({ where: { token } });
  if (!session || session.expiresAt < new Date() || session.role !== "student") {
    if (session) await prisma.session.delete({ where: { token } });
    return NextResponse.json({ authenticated: false }, { headers: { "Cache-Control": "no-store" } });
  }
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return NextResponse.json({ authenticated: false }, { headers: { "Cache-Control": "no-store" } });
  const where: any = { email: user.email };
  if (user.admissionId) where.OR = [{ id: user.admissionId }, { email: user.email }];
  const admission = await prisma.admission.findFirst({ where });
  return NextResponse.json({ authenticated: true, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, course: user.course, medium: user.medium, mode: user.mode, createdAt: user.createdAt.toISOString() }, admission }, { headers: { "Cache-Control": "no-store" } });
}