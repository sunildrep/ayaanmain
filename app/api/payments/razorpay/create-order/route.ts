import { NextRequest, NextResponse } from "next/server";
import { requireStudentSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { createOrder } from "@/lib/razorpay";

const isDummyKey = (process.env.RAZORPAY_KEY_ID || "").startsWith("rzp_test_dummy");

export async function POST(req: NextRequest) {
  const auth = await requireStudentSession(req);
  if (auth.error) return auth.error;

  const body = await req.json();
  const { admissionId, amount } = body;

  if (!admissionId || !amount) {
    return NextResponse.json({ error: "admissionId and amount required" }, { status: 400 });
  }

  const admission = await prisma.admission.findUnique({ where: { id: admissionId } });
  if (!admission) {
    return NextResponse.json({ error: "Admission not found" }, { status: 404 });
  }

  if (admission.email !== auth.session.username) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Server-side amount validation: must match admission balance or fee
  const expected = admission.balanceDue ?? admission.totalFee ?? admission.amount ?? 0;
  const reqAmount = Math.round(Number(amount));
  if (!Number.isFinite(reqAmount) || reqAmount <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  // Allow paying any positive amount up to balance, but not exceeding by more than 0
  if (expected > 0 && reqAmount > expected) return NextResponse.json({ error: `Amount exceeds balance ₹${expected.toLocaleString("en-IN")}` }, { status: 400 });
  if (process.env.NODE_ENV === "production" && isDummyKey) {
    return NextResponse.json({ error: "Payments not configured — dummy keys in production" }, { status: 500 });
  }

  let order: { id: string; amount: number; currency: string } | null = null;

  if (isDummyKey) {
    if (process.env.NODE_ENV === "production") return NextResponse.json({ error: "Dummy keys not allowed in production" }, { status: 500 });
    // Mock order for development with dummy keys
    order = {
      id: `order_mock_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      amount: reqAmount * 100,
      currency: "INR",
    };
  } else {
    try {
      const receipt = `adm_${admissionId}_${Date.now()}`;
      const razorpayOrder = await createOrder(reqAmount, "INR", receipt, {
        admissionId,
        course: admission.course,
        mode: admission.mode,
      });
      order = {
        id: razorpayOrder.id,
        amount: typeof razorpayOrder.amount === "string" ? parseInt(razorpayOrder.amount, 10) : razorpayOrder.amount,
        currency: razorpayOrder.currency,
      };
    } catch (e: any) {
      return NextResponse.json({ error: `Failed to create Razorpay order: ${e.message}` }, { status: 500 });
    }
  }

  await prisma.payment.create({
    data: {
      id: `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      admissionId,
      studentId: auth.session.userId,
      name: admission.name,
      phone: admission.phone,
      email: admission.email,
      course: admission.course,
      medium: admission.medium,
      mode: admission.mode,
      amount: reqAmount,
      paidAmount: 0,
      paymentMethod: "razorpay",
      transactionId: order.id,
      status: "pending",
    },
  });

  return NextResponse.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  });
}