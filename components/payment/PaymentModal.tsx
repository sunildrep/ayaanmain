"use client";

import { useState } from "react";
import RazorpayCheckout from "./RazorpayCheckout";

interface PendingPayment {
  id: string;
  admissionId: string;
  amount: number;
  course: string;
  status: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingPayment: PendingPayment | null;
  userName: string;
  userEmail: string;
  userPhone: string;
}

export default function PaymentModal({
  isOpen,
  onClose,
  pendingPayment,
  userName,
  userEmail,
  userPhone,
}: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderData, setOrderData] = useState<{ orderId: string; amount: number } | null>(null);

  const createOrder = async () => {
    if (!pendingPayment) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/payments/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admissionId: pendingPayment.admissionId,
          amount: pendingPayment.amount,
          course: pendingPayment.course,
          mode: "Residential",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create order");
      setOrderData({ orderId: data.orderId, amount: data.amount / 100 });
      setShowCheckout(true);
    } catch (e: any) {
      setError(e.message);
      setShowCheckout(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = async (paymentId: string, orderId: string, signature: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/razorpay/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
          admissionId: pendingPayment?.admissionId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment verification failed");
      setShowCheckout(false);
      onClose();
      window.location.reload();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (err: string) => {
    setError(err);
    setShowCheckout(false);
  };

  const handleClose = () => {
    setShowCheckout(false);
    setError("");
  };

  if (!isOpen || !pendingPayment) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-navy-900">Complete Payment</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
          </div>

          <div className="card p-4 mb-4">
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Course:</span> <span className="font-medium">{pendingPayment.course}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Amount:</span> <span className="font-bold text-sky-600">₹{pendingPayment.amount.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Status:</span> <span className="font-medium text-amber-600">{pendingPayment.status}</span></div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
          )}

          {showCheckout && orderData ? (
            <RazorpayCheckout
              orderId={orderData.orderId}
              amount={orderData.amount}
              userName={userName}
              userEmail={userEmail}
              userPhone={userPhone}
              course={pendingPayment.course}
              onSuccess={handleSuccess}
              onError={handleError}
              onClose={handleClose}
            />
          ) : (
            <button
              onClick={createOrder}
              disabled={loading}
              className="btn-primary w-full justify-center disabled:opacity-50"
            >
              {loading ? "Creating Order…" : `Pay ₹${pendingPayment.amount.toLocaleString()} via Razorpay`}
            </button>
          )}

          <p className="mt-4 text-center text-xs text-slate-500">
            Secure payment powered by Razorpay. UPI, Cards, Net Banking, Wallets supported.
          </p>
        </div>
      </div>
    </div>
  );
}