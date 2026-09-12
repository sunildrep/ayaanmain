import { NextRequest, NextResponse } from "next/server";
import { requireStudentSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

// Student view: own admissions with per-split payments + totals
export async function GET(req: NextRequest) {
  const auth = await requireStudentSession(req);
  if (auth.error) return auth.error;
  const user = await prisma.user.findUnique({ where: { id: auth.session.userId } });
  if (!user) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  const admissions = await prisma.admission.findMany({
    where: { OR: [{ email: user.email }, { id: user.admissionId || "" }] },
    orderBy: { createdAt: "desc" },
  });
  const ids = admissions.map((a) => a.id);
  const splits = ids.length > 0 ? await prisma.admissionPayment.findMany({ where: { admissionId: { in: ids } }, orderBy: { createdAt: "asc" } }) : [];
  const result = admissions.map((a) => ({
    admission: {
      id: a.id,
      course: a.course,
      mode: a.mode,
      status: a.status,
      amount: a.amount,
      discount: a.discount,
      totalFee: a.totalFee,
      payingNow: a.payingNow,
      balanceDue: a.balanceDue,
      createdAt: a.createdAt,
    },
    payments: splits.filter((s) => s.admissionId === a.id),
    paid: splits.filter((s) => s.admissionId === a.id).reduce((s, x) => s + x.amount, 0),
  }));
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
