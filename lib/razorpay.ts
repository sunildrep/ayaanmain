import Razorpay from "razorpay";

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_dummy_key_id",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "rzp_test_dummy_key_secret",
});

export function createOrder(amount: number, currency: string = "INR", receipt: string, notes?: Record<string, string>) {
  return razorpay.orders.create({
    amount: amount * 100, // Razorpay expects amount in paise
    currency,
    receipt,
    notes,
  });
}

export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
  const crypto = require("crypto");
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "rzp_test_dummy_key_secret")
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return expectedSignature === signature;
}