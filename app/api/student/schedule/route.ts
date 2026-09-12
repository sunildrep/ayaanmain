import { NextRequest, NextResponse } from "next/server";
import { requireStudentSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { dueStatus } from "@/lib/identifiers";

// Student's own admission summary + installments with computed outstanding/due status
export async function GET(req: NextRequest) {
  const auth = await requireStudentSession(req);
  if (auth.error) return auth.error;
  const user = await prisma.user.findUnique({ where: { id: auth.session.userId } });
  if (!user) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  const admissions = await prisma.admission.findMany({
    where: { OR: [{ email: user.email }, { id: user.admissionId || "" }] },
    orderBy: { createdAt: "desc" },
  });

  const result = [];
  for (const a of admissions) {
    const installments = await prisma.installment.findMany({
      where: { admissionId: a.id },
      orderBy: { seq: "asc" },
    });
    const withDue = installments.map((i) => {
      const outstanding = Math.max(0, i.originalAmount - (i.paidAmount || 0));
      return { ...i, outstanding, dueStatus: dueStatus(outstanding, i.dueDate) };
    });
    const acked = await prisma.feePayment.findMany({ where: { admissionId: a.id, status: "acknowledged" } });
    const totalPaid = acked.reduce((s, p) => s + p.amount, 0);
    const finalFee = a.finalFee ?? a.totalFee ?? 0;
    result.push({
      admission: {
        id: a.id,
        applicationId: a.applicationId,
        studentId: a.applicantStudentId,
        course: a.course,
        mode: a.mode,
        branch: a.branch,
        batchName: a.batchName,
        durationName: a.durationName,
        status: a.status,
        admissionStartDate: a.admissionStartDate,
        courseEndDate: a.courseEndDate,
        finalFee,
        totalPaid,
        outstanding: Math.max(0, finalFee - totalPaid),
      },
      installments: withDue,
    });
  }
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
