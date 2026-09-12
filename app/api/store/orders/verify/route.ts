import { NextRequest, NextResponse } from "next/server";
import { requireStudentSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { verifyPaymentSignature } from "@/lib/razorpay";

const isDummyKey = (process.env.RAZORPAY_KEY_ID || "").startsWith("rzp_test_dummy");

export async function POST(req: NextRequest) {
  const auth = await requireStudentSession(req);
  if (auth.error) return auth.error;
  const body = await req.json();
  const { orderId, razorpay_payment_id, razorpay_signature } = body;
  if (!orderId || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "orderId, razorpay_payment_id and razorpay_signature required" }, { status: 400 });
  }

  const order = await prisma.storeOrder.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order || order.userId !== auth.session.userId) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Idempotent: already confirmed → return success without re-processing
  if (order.paymentStatus === "success") {
    return NextResponse.json({ ok: true, orderId: order.id, orderNo: order.orderNo, already: true });
  }
  if (!order.razorpayOrderId) {
    return NextResponse.json({ error: "No Razorpay order linked" }, { status: 400 });
  }

  let isValid = false;
  if (isDummyKey) {
    isValid = String(razorpay_signature).startsWith("mock_");
  } else {
    isValid = verifyPaymentSignature(order.razorpayOrderId, String(razorpay_payment_id), String(razorpay_signature));
  }
  if (!isValid) {
    await prisma.storeOrder.update({ where: { id: order.id }, data: { status: "payment_failed", paymentStatus: "failed" } });
    await prisma.orderEvent.create({ data: { orderId: order.id, actor: auth.session.username, action: "payment_failed", note: "Signature mismatch" } });
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  // Decrement stock (fail-safe: abort if any line went out of stock meanwhile)
  for (const line of order.items) {
    const p = await prisma.storeItem.findUnique({ where: { id: line.storeItemId } });
    if (!p || p.stock < line.qty) {
      await prisma.storeOrder.update({ where: { id: order.id }, data: { status: "payment_failed", paymentStatus: "failed" } });
      await prisma.orderEvent.create({ data: { orderId: order.id, actor: "system", action: "payment_failed", note: `${line.name} went out of stock` } });
      return NextResponse.json({ error: `${line.name} is out of stock — payment not captured` }, { status: 400 });
    }
  }
  for (const line of order.items) {
    const p = await prisma.storeItem.findUnique({ where: { id: line.storeItemId } });
    if (p) await prisma.storeItem.update({ where: { id: p.id }, data: { stock: Math.max(0, p.stock - line.qty) } });
  }

  await prisma.storeOrder.update({
    where: { id: order.id },
    data: { status: "payment_confirmed", paymentStatus: "success", razorpayPaymentId: String(razorpay_payment_id) },
  });
  await prisma.orderEvent.create({ data: { orderId: order.id, actor: auth.session.username, action: "payment_success", note: `Payment ${razorpay_payment_id}` } });

  // Clear cart only after successful payment
  await prisma.cartItem.deleteMany({ where: { userId: auth.session.userId } });

  const updated = await prisma.storeOrder.findUnique({
    where: { id: order.id },
    include: { items: true, events: { orderBy: { createdAt: "asc" } } },
  });
  return NextResponse.json({ ok: true, order: updated });
}
