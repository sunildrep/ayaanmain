import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPaymentSignature } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || secret === "dummy_webhook_secret") {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const signature = req.headers.get("x-razorpay-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const crypto = await import("crypto");
  const expectedSignature = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  let valid = false;
  try {
    const a = Buffer.from(expectedSignature, "hex");
    const b = Buffer.from(String(signature), "hex");
    valid = a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    valid = expectedSignature === signature;
  }
  if (!valid) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }
  const body = JSON.parse(raw);

  const event = body.event;
  const payload = body.payload;

  if (event === "payment.captured") {
    const payment = payload.payment.entity;
    const orderId = payment.order_id;
    const paymentId = payment.id;

    const existingPayment = await prisma.payment.findFirst({
      where: { transactionId: orderId },
    });

    if (existingPayment) {
      // Idempotency: skip if already approved and idempotent
      if (existingPayment.status === "approved") return NextResponse.json({ ok: true, already: true });
      // Verify amount matches (Razorpay amount in paise)
      const rzpAmount = payment.amount ? Math.round(Number(payment.amount) / 100) : null;
      if (rzpAmount !== null && rzpAmount !== existingPayment.amount) {
        console.warn(`Webhook amount mismatch: order ${orderId} expected ${existingPayment.amount} got ${rzpAmount}`);
        return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
      }
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: "approved",
          paidAmount: existingPayment.amount,
          transactionId: paymentId,
          approvedAt: new Date(),
        },
      });

      await prisma.admission.update({
        where: { id: existingPayment.admissionId },
        data: { status: "approved", approvedAt: new Date() },
      });
    }
  }

  if (event === "payment.failed") {
    const payment = payload.payment.entity;
    const orderId = payment.order_id;

    const existingPayment = await prisma.payment.findFirst({
      where: { transactionId: orderId },
    });

    if (existingPayment) {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: "failed",
        },
      });
    }
  }

  return NextResponse.json({ ok: true });
}