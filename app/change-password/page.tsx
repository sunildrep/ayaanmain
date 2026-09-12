"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const [oldPw, setOldPw] = useState("");
  const [nw, setNw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (nw.length < 6) return setErr("New password min 6 chars");
    if (nw !== confirm) return setErr("Passwords do not match");
    if (nw === oldPw) return setErr("New password must differ from old");
    setLoading(true);
    const r = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldPassword: oldPw, newPassword: nw }),
    });
    const d = await r.json().catch(() => ({}));
    setLoading(false);
    if (r.ok) router.push("/account");
    else setErr(d.error || "Failed");
  };

  return (
    <div className="min-h-[70vh] bg-slate-50 grid place-items-center p-4">
      <div className="card p-8 w-full max-w-md">
        <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white grid place-items-center font-bold mx-auto">!</div>
        <h1 className="mt-3 font-display font-bold text-xl text-navy-900 text-center">Change Your Password</h1>
        <p className="text-sm text-slate-500 text-center mt-1">First login requires a new password. It must differ from the initial one.</p>
        <form onSubmit={submit} className="mt-6 grid gap-3">
          <input value={oldPw} onChange={(e) => setOldPw(e.target.value)} placeholder="Current password" type="password" required className="px-4 py-3 rounded-xl border border-slate-200 text-sm" />
          <input value={nw} onChange={(e) => setNw(e.target.value)} placeholder="New password (min 6)" type="password" required className="px-4 py-3 rounded-xl border border-slate-200 text-sm" />
          <input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm new password" type="password" required className="px-4 py-3 rounded-xl border border-slate-200 text-sm" />
          {err && <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">{err}</div>}
          <button type="submit" disabled={loading} className="btn-primary justify-center disabled:opacity-50">{loading ? "Updating…" : "Set New Password →"}</button>
        </form>
      </div>
    </div>
  );
}
