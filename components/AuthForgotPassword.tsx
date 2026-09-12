"use client";
import { useState } from "react";

export default function AuthForgotPassword({ onClose, defaultEmail = "" }: { onClose: () => void; defaultEmail?: string }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState(defaultEmail);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const sendOtp = async () => {
    setMsg(null);
    if (!email.trim() || !email.includes("@")) return setMsg({ type: "error", text: "Valid email required" });
    setLoading(true);
    const r = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
    const d = await r.json().catch(() => ({}));
    setLoading(false);
    if (r.ok) {
      setMsg({ type: "success", text: d.message || "OTP sent — check inbox/spam" });
      setStep(2);
    } else setMsg({ type: "error", text: d.error || "Failed to send OTP" });
  };

  const verifyAndReset = async () => {
    setMsg(null);
    if (!otp.trim()) return setMsg({ type: "error", text: "OTP required (6 digits from email)" });
    if (newPassword.length < 6) return setMsg({ type: "error", text: "New password min 6 chars" });
    if (newPassword !== confirmPassword) return setMsg({ type: "error", text: "Passwords do not match" });
    setLoading(true);
    const r = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase(), token: otp.trim(), newPassword }),
    });
    const d = await r.json().catch(() => ({}));
    setLoading(false);
    if (r.ok) {
      setMsg({ type: "success", text: d.message || "Password reset successful!" });
      setTimeout(() => onClose(), 2000);
    } else setMsg({ type: "error", text: d.error || "Failed to reset" });
  };

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/40 backdrop-blur-sm p-4 grid place-items-center" onClick={onClose}>
      <div className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-lg text-navy-900">Reset Password — OTP to Email</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 grid place-items-center hover:bg-slate-200">✕</button>
        </div>
        <p className="text-sm text-slate-600 mt-1">We’ll send a 6-digit OTP to your registered email. Enter OTP + new password.</p>

        {step === 1 ? (
          <div className="mt-4 grid gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700">Email *</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
            </div>
            {msg && <div className={`text-sm px-3 py-2 rounded-xl border ${msg.type === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>{msg.text}</div>}
            <button onClick={sendOtp} disabled={loading} className="btn-primary justify-center disabled:opacity-50">{loading ? "Sending…" : "Send OTP →"}</button>
            <div className="text-xs text-slate-400 text-center">OTP valid 1 hour • Check spam folder</div>
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            <div className="text-xs text-slate-500">OTP sent to <b className="text-navy-900">{email}</b> • <button onClick={() => setStep(1)} className="text-sky-700 hover:underline">Change email</button></div>
            <div>
              <label className="text-xs font-medium text-slate-700">OTP (6 digits) *</label>
              <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" inputMode="numeric" maxLength={8} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm tracking-widest" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700">New Password * (min 6)</label>
              <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" type="password" className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700">Confirm New Password *</label>
              <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" type="password" className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
            </div>
            {msg && <div className={`text-sm px-3 py-2 rounded-xl border ${msg.type === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>{msg.text}</div>}
            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="flex-1 py-2.5 rounded-full border border-slate-200 bg-white text-sm">Back</button>
              <button onClick={verifyAndReset} disabled={loading} className="flex-1 py-2.5 rounded-full bg-navy-900 text-white text-sm font-medium disabled:opacity-50">{loading ? "Verifying…" : "Reset Password →"}</button>
            </div>
            <button onClick={sendOtp} disabled={loading} className="text-xs text-sky-700 hover:underline text-center">Resend OTP</button>
          </div>
        )}
      </div>
    </div>
  );
}
