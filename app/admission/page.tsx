"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Batch = { id: string; course: string; medium: string; mode: string; startDate: string };

export default function AdmissionPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [form, setForm] = useState({
    name: "",
    fatherName: "",
    phone: "",
    email: "",
    address: "",
    reference: "",
    branch: "Warangal",
    course: "SI",
    courseType: "Regular",
    medium: "Telugu",
    mode: "Residential",
    batchId: "",
    paymentMethod: "cash",
    transactionId: "",
    screenshot: "",
  });
  const [screenshotName, setScreenshotName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; id?: string; error?: string } | null>(null);

  useEffect(() => {
    fetch("/api/batches").then((r) => r.json()).then((d) => Array.isArray(d) && setBatches(d.filter((b: any) => b.status !== "closed"))).catch(() => {});
  }, []);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 3 * 1024 * 1024) return alert("Screenshot must be <3MB");
    setScreenshotName(f.name);
    const reader = new FileReader();
    reader.onload = () => setForm({ ...form, screenshot: String(reader.result) });
    reader.readAsDataURL(f);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    if (!form.name.trim() || !form.fatherName.trim() || !form.phone.trim() || !form.email.trim() || !form.address.trim() || !form.branch.trim()) {
      setSubmitting(false);
      setResult({ ok: false, error: "Name, Father Name, phone, email, address, branch are required" });
      return;
    }
    if (form.paymentMethod === "upi" && (!form.transactionId.trim() || !form.screenshot)) {
      setSubmitting(false);
      setResult({ ok: false, error: "UPI requires Transaction ID and Screenshot" });
      return;
    }
    if (form.paymentMethod === "bank" && !form.transactionId.trim()) {
      setSubmitting(false);
      setResult({ ok: false, error: "Bank transfer requires Transaction ID" });
      return;
    }
    const r = await fetch("/api/admissions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await r.json();
    setSubmitting(false);
    if (r.ok) setResult({ ok: true, id: data.id });
    else setResult({ ok: false, error: data.error || "Failed" });
  };

  if (result?.ok) {
    return (
      <div className="min-h-[70vh] bg-slate-50 grid place-items-center p-4">
        <div className="card p-8 max-w-lg w-full text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 grid place-items-center mx-auto text-xl">✓</div>
          <h1 className="mt-4 font-display font-bold text-xl text-navy-900">Admission Submitted!</h1>
          <p className="text-sm text-slate-600 mt-2">Your application <b className="text-navy-900">{result.id}</b> is under review. Admin will approve and create your login.</p>
          <p className="text-xs text-slate-500 mt-2">You’ll be able to login at <b>/login</b> with the email you provided once approved.</p>
          <div className="mt-6 flex gap-2 justify-center">
            <Link href="/login" className="btn-primary">Go to Login →</Link>
            <Link href="/" className="btn-ghost">Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfcfd] py-8">
      <div className="container-soft">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <h1 className="font-display font-bold text-3xl text-navy-900">Get Admission</h1>
            <p className="text-sm text-slate-600 mt-2">Fill your details, choose course & branch. Admin approval → login to see your data.</p>
            <div className="mt-3 inline-flex gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">Secure</span>
              <span className="px-3 py-1 rounded-full bg-white border border-slate-200">Support: +91 88866 67222</span>
            </div>
          </div>

          <form onSubmit={submit} className="card mt-8 p-6 lg:p-8 grid gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="text-xs font-medium text-slate-700">Full Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Sai Kumar" required className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" /></div>
              <div><label className="text-xs font-medium text-slate-700">Father Name *</label><input value={form.fatherName} onChange={(e) => setForm({ ...form, fatherName: e.target.value })} placeholder="e.g., Ramesh Kumar" required className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" /></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="text-xs font-medium text-slate-700">Email * (login ID)</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" /></div>
              <div><label className="text-xs font-medium text-slate-700">Mobile * (10 digits)</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="9876543210" pattern="[0-9]{10}" required className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" /></div>
            </div>
            <div><label className="text-xs font-medium text-slate-700">Address *</label><textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="H.No, Street, Village, District, State - PIN" required rows={2} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" /></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="text-xs font-medium text-slate-700">Reference (optional)</label><input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="Referred by / Friend / Ad" className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" /></div>
              <div><label className="text-xs font-medium text-slate-700">Branch *</label><select value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} required className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"><option>Warangal</option><option>Hyderabad</option><option>Hanamkonda</option><option>Bollikunta (Residential)</option></select></div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div><label className="text-xs font-medium text-slate-700">Course *</label><select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"><option>SI</option><option>Constable</option><option>Groups</option><option>SSC GD</option><option>Defence</option><option>Army</option><option>UPSC</option></select></div>
              <div><label className="text-xs font-medium text-slate-700">Course Type</label><select value={form.courseType} onChange={(e) => setForm({ ...form, courseType: e.target.value })} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"><option>Regular</option><option>Crash</option><option>Weekend</option><option>Online</option></select></div>
              <div><label className="text-xs font-medium text-slate-700">Medium</label><select value={form.medium} onChange={(e) => setForm({ ...form, medium: e.target.value })} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"><option>Telugu</option><option>English</option></select></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><label className="text-xs font-medium text-slate-700">Mode</label><select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"><option>Residential</option><option>Offline</option><option>Online</option></select></div>
              <div><label className="text-xs font-medium text-slate-700">Preferred Batch (optional)</label><select value={form.batchId} onChange={(e) => setForm({ ...form, batchId: e.target.value })} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"><option value="">Any batch — auto assign</option>{batches.map((b) => (<option key={b.id} value={b.id}>{b.course} • {b.medium} • {b.mode} — {new Date(b.startDate).toLocaleDateString("en-IN")} ({b.id})</option>))}</select></div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <div className="text-sm font-semibold text-navy-900">Payment Proof</div>
              <div className="mt-3 grid sm:grid-cols-3 gap-2">
                {[
                  { id: "cash", label: "Cash", desc: "No proof needed" },
                  { id: "upi", label: "UPI", desc: "Txn ID + Screenshot" },
                  { id: "bank", label: "Bank Transfer", desc: "Txn ID" },
                ].map((p) => (
                  <button key={p.id} type="button" onClick={() => setForm({ ...form, paymentMethod: p.id })} className={`p-3 rounded-xl border text-left ${form.paymentMethod === p.id ? "bg-navy-900 text-white border-navy-900" : "bg-white border-slate-200 hover:bg-slate-50"}`}>
                    <div className="text-sm font-semibold">{p.label}</div>
                    <div className={`text-xs ${form.paymentMethod === p.id ? "text-white/70" : "text-slate-500"}`}>{p.desc}</div>
                  </button>
                ))}
              </div>
              {(form.paymentMethod === "upi" || form.paymentMethod === "bank") && (
                <div className="mt-3">
                  <label className="text-xs font-medium text-slate-700">Transaction ID * {form.paymentMethod === "bank" ? "(bank)" : "(UPI)"}</label>
                  <input value={form.transactionId} onChange={(e) => setForm({ ...form, transactionId: e.target.value })} placeholder={form.paymentMethod === "upi" ? "e.g., UPI/1234..." : "e.g., NEFT/IMPS ref"} required className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
                </div>
              )}
              {form.paymentMethod === "upi" && (
                <div className="mt-3">
                  <label className="text-xs font-medium text-slate-700">Screenshot * (UPI)</label>
                  <div className="mt-1 flex items-center gap-3">
                    <label className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm hover:bg-slate-50 cursor-pointer">
                      <input type="file" accept="image/*" onChange={onFile} className="hidden" />
                      {screenshotName ? screenshotName : "Choose image…"}
                    </label>
                    {form.screenshot && <span className="text-xs text-emerald-700">✓ Ready ({(form.screenshot.length / 1024).toFixed(0)} KB)</span>}
                  </div>
                  {form.screenshot && <img src={form.screenshot} alt="proof" className="mt-3 max-h-40 rounded-xl border border-slate-200" />}
                </div>
              )}
              {form.paymentMethod === "cash" && <div className="mt-3 text-xs text-slate-500 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl">Cash: please pay at branch (Warangal/Hyderabad/Hanamkonda). No proof needed — admin will verify in person.</div>}
            </div>

            {result?.error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">{result.error}</div>}

            <button type="submit" disabled={submitting} className="btn-primary justify-center !py-3 text-[15px] disabled:opacity-50">
              {submitting ? "Submitting…" : "Submit Admission →"}
            </button>
            <div className="text-center text-xs text-slate-500">By submitting, you agree to verification. Already applied? <Link href="/login" className="text-sky-700 hover:underline">Login to check status</Link></div>
          </form>
        </div>
      </div>
    </div>
  );
}
