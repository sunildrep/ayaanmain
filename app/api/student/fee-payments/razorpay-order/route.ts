import { NextRequest, NextResponse } from "next/server";
import { requireStudentSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { createOrder } from "@/lib/razorpay";
import { audit } from "@/lib/identifiers";

const isDummyKey = (process.env.RAZORPAY_KEY_ID || "").startsWith("rzp_test_dummy");

// Create a Razorpay order for an existing submitted FeePayment
export async function POST(req: NextRequest) {
  const auth = await requireStudentSession(req);
  if (auth.error) return auth.error;
  const body = await req.json();
  const { feePaymentId } = body;
  if (!feePaymentId) return NextResponse.json({ error: "feePaymentId required" }, { status: 400 });

  const pay = await prisma.feePayment.findUnique({ where: { id: String(feePaymentId) } });
  if (!pay || pay.studentId !== auth.session.userId) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }
  if (pay.method !== "razorpay") return NextResponse.json({ error: "Not a Razorpay payment" }, { status: 400 });
  if (pay.status === "acknowledged") return NextResponse.json({ error: "Already acknowledged" }, { status: 400 });

  const adm = await prisma.admission.findUnique({ where: { id: pay.admissionId } });
  let rzpOrderId: string;
  if (isDummyKey) {
    rzpOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  } else {
    try {
      const o = await createOrder(pay.amount, "INR", `fee_${pay.id}_${Date.now()}`, {
        feePaymentId: pay.id,
        admissionId: pay.admissionId,
      });
      rzpOrderId = o.id;
    } catch (e: any) {
      return NextResponse.json({ error: `Razorpay failed: ${e.message}` }, { status: 500 });
    }
  }

  await prisma.feePayment.update({ where: { id: pay.id }, data: { razorpayOrderId: rzpOrderId } });
  await audit("payment", pay.id, auth.session.username, "payment_initiated", `Razorpay order ${rzpOrderId}`);
  const user = await prisma.user.findUnique({ where: { id: auth.session.userId } });
  return NextResponse.json({
    ok: true,
    razorpayOrderId: rzpOrderId,
    amount: pay.amount * 100,
    currency: "INR",
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    name: user?.name,
    email: user?.email,
    phone: user?.phone,
    applicationId: adm?.applicationId,
  });
}
