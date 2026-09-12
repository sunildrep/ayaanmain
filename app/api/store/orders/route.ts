import { NextRequest, NextResponse } from "next/server";
import { requireStudentSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { createOrder } from "@/lib/razorpay";

const isDummyKey = (process.env.RAZORPAY_KEY_ID || "").startsWith("rzp_test_dummy");

function orderNo() {
  return `AYN-${Date.now().toString().slice(-6)}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

async function logEvent(orderId: string, actor: string, action: string, note?: string) {
  await prisma.orderEvent.create({ data: { orderId, actor, action, note: note || null } });
}

// GET — user's own orders with items + timeline
export async function GET(req: NextRequest) {
  const auth = await requireStudentSession(req);
  if (auth.error) return auth.error;
  const orders = await prisma.storeOrder.findMany({
    where: { userId: auth.session.userId },
    include: { items: true, events: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders, { headers: { "Cache-Control": "no-store" } });
}

// POST — create order from cart + Razorpay order (Product → Cart → Checkout → Payment)
export async function POST(req: NextRequest) {
  const auth = await requireStudentSession(req);
  if (auth.error) return auth.error;

  const cart = await prisma.cartItem.findMany({ where: { userId: auth.session.userId } });
  if (cart.length === 0) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

  const ids: string[] = [];
  for (const c of cart) if (ids.indexOf(c.storeItemId) === -1) ids.push(c.storeItemId);
  const products = await prisma.storeItem.findMany({ where: { id: { in: ids } } });
  const byId: Record<string, (typeof products)[number]> = {};
  for (const p of products) byId[p.id] = p;

  // Validate stock + sizes, compute subtotal
  let subtotal = 0;
  const lines: { storeItemId: string; name: string; price: number; qty: number; size: string | null }[] = [];
  for (const c of cart) {
    const p = byId[c.storeItemId];
    if (!p) return NextResponse.json({ error: "A product in your cart is no longer available" }, { status: 400 });
    if (p.stock < c.qty) return NextResponse.json({ error: `${p.name}: only ${p.stock} in stock` }, { status: 400 });
    const sizes: string[] = (p as any).sizes || [];
    if (sizes.length > 0 && (!c.size || !sizes.includes(c.size))) {
      return NextResponse.json({ error: `${p.name}: please choose a valid size` }, { status: 400 });
    }
    subtotal += p.price * c.qty;
    lines.push({ storeItemId: p.id, name: p.name, price: p.price, qty: c.qty, size: c.size || null });
  }
  if (subtotal <= 0) return NextResponse.json({ error: "Invalid cart total" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: auth.session.userId } });
  if (!user) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  // Unique order number (retry on collision)
  let no = orderNo();
  for (let i = 0; i < 3; i++) {
    const exists = await prisma.storeOrder.findUnique({ where: { orderNo: no } });
    if (!exists) break;
    no = orderNo();
  }

  const order = await prisma.storeOrder.create({
    data: {
      orderNo: no,
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      subtotal,
      status: "placed",
      paymentStatus: "pending",
      items: { create: lines },
    },
  });
  await logEvent(order.id, user.email, "order_created", `${lines.length} item(s), ₹${subtotal.toLocaleString("en-IN")}`);

  // Create Razorpay order (mock when dummy keys)
  let rzpOrderId: string;
  if (isDummyKey) {
    rzpOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  } else {
    try {
      const rzp = await createOrder(subtotal, "INR", no, { orderId: order.id, orderNo: no, email: user.email });
      rzpOrderId = rzp.id;
    } catch (e: any) {
      await prisma.storeOrder.update({ where: { id: order.id }, data: { status: "payment_failed", paymentStatus: "failed" } });
      await logEvent(order.id, "system", "payment_failed", `Razorpay order failed: ${e.message}`);
      return NextResponse.json({ error: `Payment init failed: ${e.message}` }, { status: 500 });
    }
  }

  await prisma.storeOrder.update({ where: { id: order.id }, data: { razorpayOrderId: rzpOrderId } });
  await logEvent(order.id, user.email, "payment_initiated", `Razorpay order ${rzpOrderId}`);

  return NextResponse.json({
    ok: true,
    orderId: order.id,
    orderNo: no,
    razorpayOrderId: rzpOrderId,
    amount: subtotal * 100,
    currency: "INR",
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    name: user.name,
    email: user.email,
    phone: user.phone,
  });
}
