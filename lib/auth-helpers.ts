import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function requireAdminSession(req: NextRequest, allowedRoles?: string[]): Promise<{ session: any; error?: NextResponse }> {
  const token = req.cookies.get("ayaan_session")?.value;
  if (!token) return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const session = await prisma.session.findUnique({ where: { token } });
  if (!session || session.expiresAt < new Date()) {
    if (session) await prisma.session.delete({ where: { token } });
    return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (session.role === "student") {
    return { session: null, error: NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 }) };
  }
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    return { session: null, error: NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 }) };
  }
  return { session, error: undefined };
}

export async function requireStudentSession(req: NextRequest): Promise<{ session: any; error?: NextResponse }> {
  const token = req.cookies.get("ayaan_session")?.value;
  if (!token) return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const session = await prisma.session.findUnique({ where: { token } });
  if (!session || session.expiresAt < new Date() || session.role !== "student") {
    if (session) await prisma.session.delete({ where: { token } });
    return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, error: undefined };
}