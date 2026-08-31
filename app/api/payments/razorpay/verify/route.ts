import { NextRequest, NextResponse } from "next/server";
import { requireStudentSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { verifyPaymentSignature } from "@/lib/razorpay";

const isDummyKey = (process.env.RAZORPAY_KEY_ID || "").startsWith("rzp_test_dummy");

export async function POST(req: NextRequest) {
  const auth = await requireStudentSession(req);
  if (auth.error) return auth.error;

  const body = await req.json();
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, admissionId } = body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing payment verification fields" }, { status: 400 });
  }

  let isValid = false;
  if (isDummyKey) {
    // For dummy keys, accept any signature that starts with "mock_"
    isValid = razorpay_signature.startsWith("mock_");
  } else {
    isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  }

  if (!isValid) {
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  const payment = await prisma.payment.findFirst({
    where: { transactionId: razorpay_order_id },
  });

  if (!payment) {
    return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
  }

  if (payment.studentId !== auth.session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "approved",
      paidAmount: payment.amount,
      transactionId: razorpay_payment_id,
      approvedAt: new Date(),
    },
  });

  await prisma.admission.update({
    where: { id: payment.admissionId },
    data: { status: "approved", approvedAt: new Date() },
  });

  if (payment.studentId) {
    await prisma.user.update({
      where: { id: payment.studentId },
      data: { admissionId: payment.admissionId },
    });
  }

  return NextResponse.json({ ok: true, paymentId: payment.id });
}