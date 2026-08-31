import { NextRequest, NextResponse } from "next/server";
import { requireStudentSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const auth = await requireStudentSession(req);
  if (auth.error) return auth.error;

  const payments = await prisma.payment.findMany({
    where: { studentId: auth.session.userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(payments, { headers: { "Cache-Control": "no-store" } });
}