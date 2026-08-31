import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPaymentSignature } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "dummy_webhook_secret";

  const signature = req.headers.get("x-razorpay-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const crypto = require("crypto");
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(body))
    .digest("hex");

  if (expectedSignature !== signature) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

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