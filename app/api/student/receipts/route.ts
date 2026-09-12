import { NextRequest, NextResponse } from "next/server";
import { requireStudentSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const auth = await requireStudentSession(req);
  if (auth.error) return auth.error;
  const list = await prisma.receipt.findMany({
    where: { studentId: auth.session.userId },
    include: { feePayment: { include: { allocations: { include: { installment: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(list, { headers: { "Cache-Control": "no-store" } });
}
