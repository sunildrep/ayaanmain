"use client";
import { useEffect } from "react";

export default function MetaMaskGuard() {
  useEffect(() => {
    const onError = (e: ErrorEvent) => {
      const msg = String(e.message || "");
      const file = String(e.filename || "");
      if (
        msg.includes("MetaMask") ||
        msg.includes("Failed to connect") ||
        file.includes("inpage.js") ||
        file.includes("chrome-extension") ||
        file.includes("ejbalbakoplchlghecdalmeeeajnimhm")
      ) {
        e.preventDefault();
        e.stopPropagation();
        // silence
        console.warn("[suppressed] MetaMask inpage error:", msg);
        return true as any;
      }
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      const reason = String((e as any).reason?.message || (e as any).reason || e);
      const stack = String((e as any).reason?.stack || "");
      if (
        reason.includes("MetaMask") ||
        reason.includes("Failed to connect") ||
        stack.includes("inpage.js") ||
        stack.includes("chrome-extension")
      ) {
        e.preventDefault();
        console.warn("[suppressed] MetaMask rejection:", reason);
      }
    };
    window.addEventListener("error", onError, true);
    window.addEventListener("unhandledrejection", onRejection, true);
    // also patch ethereum to avoid auto-connect throws
    const w = window as any;
    if (w.ethereum) {
      const orig = w.ethereum.request?.bind(w.ethereum);
      if (orig) {
        w.ethereum.request = async (...args: any[]) => {
          try {
            return await orig(...args);
          } catch (err: any) {
            const m = String(err?.message || "");
            if (m.includes("MetaMask") || m.includes("Failed to connect")) {
              console.warn("[suppressed] ethereum.request:", m);
              return null;
            }
            throw err;
          }
        };
      }
    }
    return () => {
      window.removeEventListener("error", onError, true);
      window.removeEventListener("unhandledrejection", onRejection, true);
    };
  }, []);
  return null;
}
