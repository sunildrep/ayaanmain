import { NextRequest, NextResponse } from "next/server";
import { requireStudentSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { audit } from "@/lib/identifiers";

const isDummyKey = (process.env.RAZORPAY_KEY_ID || "").startsWith("rzp_test_dummy");

// Provider-paid → internal status pending_verification (admin still acknowledges)
export async function POST(req: NextRequest) {
  const auth = await requireStudentSession(req);
  if (auth.error) return auth.error;
  const body = await req.json();
  const { feePaymentId, razorpay_payment_id, razorpay_signature } = body;
  if (!feePaymentId || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "feePaymentId, razorpay_payment_id, razorpay_signature required" }, { status: 400 });
  }
  const pay = await prisma.feePayment.findUnique({ where: { id: String(feePaymentId) } });
  if (!pay || pay.studentId !== auth.session.userId) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }
  if (pay.status === "acknowledged") return NextResponse.json({ ok: true, already: true });
  if (!pay.razorpayOrderId) return NextResponse.json({ error: "No Razorpay order linked" }, { status: 400 });

  let valid = false;
  if (isDummyKey) {
    valid = String(razorpay_signature).startsWith("mock_");
  } else {
    valid = verifyPaymentSignature(pay.razorpayOrderId, String(razorpay_payment_id), String(razorpay_signature));
  }
  if (!valid) {
    await prisma.feePayment.update({ where: { id: pay.id }, data: { status: "failed" } });
    await audit("payment", pay.id, auth.session.username, "payment_failed", "Signature mismatch");
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  await prisma.feePayment.update({
    where: { id: pay.id },
    data: { status: "pending_verification", transactionId: String(razorpay_payment_id) },
  });
  await audit("payment", pay.id, auth.session.username, "payment_provider_paid", `Razorpay ${razorpay_payment_id} — awaiting admin acknowledgement`);
  return NextResponse.json({ ok: true });
}
