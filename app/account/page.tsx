"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => { if (!d.authenticated) router.push("/login"); else setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, [router]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (loading) return <div className="min-h-[50vh] grid place-items-center text-slate-500">Loading…</div>;
  if (!data) return null;

  const u = data.user;
  const a = data.admission;

  return (
    <div className="bg-slate-50 min-h-[70vh] py-8">
      <div className="container-soft">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="font-display font-bold text-2xl text-navy-900">My Account</h1>
            <button onClick={logout} className="px-4 py-2 rounded-full border border-slate-200 bg-white text-sm hover:bg-slate-50">Logout</button>
          </div>

          <div className="card mt-6 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-navy-900 text-white grid place-items-center font-bold">{u.name[0]}</div>
              <div>
                <div className="font-semibold text-navy-900">{u.name}</div>
                {u.fatherName && <div className="text-xs text-slate-500">S/o {u.fatherName}</div>}
                <div className="text-sm text-slate-600">{u.email} • {u.phone}</div>
                <div className="text-xs text-slate-500">{u.course} {u.courseType ? `• ${u.courseType}` : ""} • {u.medium} • {u.mode} {u.branch ? `• ${u.branch}` : ""}</div>
                {u.address && <div className="text-xs text-slate-500 mt-1">{u.address} {u.reference ? `• Ref: ${u.reference}` : ""}</div>}
              </div>
              <span className="ml-auto px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">Active</span>
            </div>
          </div>

          <div className="card mt-4 p-6">
            <div className="font-semibold text-navy-900">Admission Details</div>
            {a ? (
              <div className="mt-3 grid gap-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Application ID</span><span className="font-medium text-navy-900">{a.id}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Father Name</span><span>{a.fatherName || "—"}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Address</span><span className="text-right max-w-[200px]">{a.address || "—"}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Branch</span><span>{a.branch || "—"}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Reference</span><span>{a.reference || "—"}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Course</span><span>{a.course} {a.courseType ? `• ${a.courseType}` : ""} • {a.medium} • {a.mode}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Batch</span><span>{a.batchId || "Auto assigned"}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Payment</span><span className="capitalize">{a.paymentMethod} {a.transactionId ? `• ${a.transactionId}` : ""} • ₹{a.amount?.toLocaleString("en-IN") || "—"}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Status</span><span className={`px-2 py-1 rounded-full text-xs border ${a.status === "approved" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : a.status === "pending" ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-red-50 border-red-200 text-red-700"}`}>{a.status}</span></div>
                {a.screenshot && <div className="mt-2"><div className="text-xs text-slate-500">Payment Screenshot</div><img src={a.screenshot} alt="proof" className="mt-1 max-h-60 rounded-xl border border-slate-200" /></div>}
                <div className="text-xs text-slate-400 mt-2">Applied: {new Date(a.createdAt).toLocaleString("en-IN")}</div>
              </div>
            ) : (
              <div className="text-sm text-slate-500 mt-2">No admission linked. Contact support.</div>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <Link href="/courses" className="btn-primary">Browse Courses →</Link>
            <Link href="/tests" className="btn-ghost">My Tests</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
