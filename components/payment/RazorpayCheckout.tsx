"use client";

import { useState, useEffect } from "react";

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color: string;
  };
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: {
    ondismiss: () => void;
  };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
      close: () => void;
      on: (event: string, callback: (response: any) => void) => void;
    };
  }
}

interface RazorpayCheckoutProps {
  orderId: string;
  amount: number;
  userName: string;
  userEmail: string;
  userPhone: string;
  course: string;
  description?: string;
  onSuccess: (paymentId: string, orderId: string, signature: string) => Promise<void>;
  onError: (error: string) => void;
  onClose: () => void;
}

export default function RazorpayCheckout({
  orderId,
  amount,
  userName,
  userEmail,
  userPhone,
  course,
  description,
  onSuccess,
  onError,
  onClose,
}: RazorpayCheckoutProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setLoaded(true);
    script.onerror = () => onError("Failed to load Razorpay SDK");
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, [onError]);

  useEffect(() => {
    if (!loaded || !window.Razorpay) return;

    const options: RazorpayOptions = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_dummy_key_id",
      amount: amount * 100,
      currency: "INR",
      name: "Ayaan Institute",
      description: description || `${course} - Admission Payment`,
      order_id: orderId,
      prefill: {
        name: userName,
        email: userEmail,
        contact: userPhone,
      },
      notes: {
        course,
      },
      theme: {
        color: "#0ea5e9",
      },
      handler: async (response) => {
        await onSuccess(response.razorpay_payment_id, response.razorpay_order_id, response.razorpay_signature);
      },
      modal: {
        ondismiss: () => {
          onClose();
        },
      },
    };

    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", (response: any) => {
      onError(response.error?.description || "Payment failed");
    });

    rzp.open();

    return () => {
      rzp.close();
    };
  }, [loaded, orderId, amount, userName, userEmail, userPhone, course, description, onSuccess, onError, onClose]);

  return null;
}