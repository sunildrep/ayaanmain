import Razorpay from "razorpay";
import crypto from "crypto";

const isDummyKey = (process.env.RAZORPAY_KEY_ID || "").startsWith("rzp_test_dummy") || (process.env.RAZORPAY_KEY_SECRET || "").startsWith("rzp_test_dummy");
function assertLiveKeys() {
  if (process.env.NODE_ENV === "production" && isDummyKey && process.env.NEXT_PHASE !== "phase-production-build") {
    throw new Error("CRITICAL: Razorpay dummy keys in production — set real RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET");
  }
}
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_dummy_key_id",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "rzp_test_dummy_key_secret",
});

export function createOrder(amount: number, currency: string = "INR", receipt: string, notes?: Record<string, string>) {
  assertLiveKeys();
  return razorpay.orders.create({
    amount: amount * 100, // Razorpay expects amount in paise
    currency,
    receipt,
    notes,
  });
}

export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
  const secret = process.env.RAZORPAY_KEY_SECRET || "rzp_test_dummy_key_secret";
  const expectedSignature = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  // timingSafeEqual to prevent timing attack
  try {
    const a = Buffer.from(expectedSignature, "hex");
    const b = Buffer.from(String(signature || ""), "hex");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return expectedSignature === signature;
  }
}