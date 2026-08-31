"use client";
import { useEffect, useState } from "react";

type Tab = "dashboard" | "rag" | "batches" | "banner" | "admissions" | "payments" | "students" | "finance" | "leads" | "alumni" | "store";
type Role = "super_admin" | "finance" | "admissions";

const roleTabs: Record<Role, Tab[]> = {
  super_admin: ["dashboard", "store", "alumni", "leads", "payments", "students", "finance", "admissions", "rag", "batches", "banner"],
  finance: ["dashboard", "payments", "finance"],
  admissions: ["dashboard", "admissions", "leads", "students", "alumni"],
};

const allTabs: { id: Tab; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "store", label: "Store Stock" },
  { id: "alumni", label: "Alumni" },
  { id: "leads", label: "Leads" },
  { id: "payments", label: "Payments" },
  { id: "students", label: "Students" },
  { id: "finance", label: "AR / AP" },
  { id: "admissions", label: "Admissions" },
  { id: "rag", label: "RAG" },
  { id: "batches", label: "Batches" },
  { id: "banner", label: "Banner" },
];

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [auth, setAuth] = useState<boolean | null>(null);
  const [role, setRole] = useState<Role>("super_admin");
  const [authUser, setAuthUser] = useState("");
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [loginErr, setLoginErr] = useState("");

  useEffect(() => {
    fetch("/api/admin/login")
      .then((r) => r.json())
      .then((d) => {
        setAuth(!!d.authenticated);
        if (d.role) setRole(d.role as Role);
        if (d.user) setAuthUser(d.user);
        if (d.authenticated && d.role) {
          const allowed = roleTabs[d.role as Role] || roleTabs.super_admin;
          if (!allowed.includes(tab)) setTab(allowed[0]);
        }
      })
      .catch(() => setAuth(false));
  }, []);

  const doLogin = async () => {
    setLoginErr("");
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: user, password: pass }) });
    const data = await r.json().catch(() => ({}));
    if (r.ok) {
      setAuth(true);
      const newRole = (data.role as Role) || "super_admin";
      setRole(newRole);
      setAuthUser(data.name || user);
      const allowed = roleTabs[newRole] || roleTabs.super_admin;
      setTab(allowed[0]);
    } else setLoginErr("Invalid username or password");
  };
  const doLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    setAuth(false);
    setRole("super_admin");
  };

  if (auth === null) return <div className="min-h-screen grid place-items-center text-slate-500">Loading…</div>;

  if (!auth) {
    return (
      <div className="min-h-screen bg-slate-50 grid place-items-center p-4">
        <div className="card p-8 w-full max-w-md">
          <div className="w-12 h-12 rounded-2xl bg-navy-900 text-white grid place-items-center font-bold">A</div>
          <h1 className="mt-4 font-display font-bold text-xl text-navy-900">Ayaan Admin</h1>
          <p className="text-sm text-slate-500">Sign in — role-based access</p>
          <div className="mt-6 grid gap-3">
            <input value={user} onChange={(e) => setUser(e.target.value)} placeholder="Username" className="px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            <input value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Password" type="password" onKeyDown={(e) => e.key === "Enter" && doLogin()} className="px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            {loginErr && <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">{loginErr}</div>}
            <button onClick={doLogin} className="btn-primary justify-center">Sign In →</button>
            <div className="text-xs text-slate-400 text-center leading-relaxed">
              <div>Super: <b className="text-slate-600">admin / Ayaan@2026</b> — all access</div>
              <div>Finance: <b className="text-slate-600">finance / Finance@2026</b> — payments only</div>
              <div>Admissions: <b className="text-slate-600">admissions / Admissions@2026</b> — admissions & leads</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const allowed = roleTabs[role] || roleTabs.super_admin;
  const visibleTabs = allTabs.filter((t) => allowed.includes(t.id));

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-navy-900 text-white grid place-items-center font-bold">A</div>
            <div>
              <div className="font-display font-bold text-navy-900 leading-none">AYAAN ADMIN</div>
              <div className="text-xs text-slate-500 capitalize">{role.replace("_", " ")} • {authUser}</div>
            </div>
            <span className={`ml-2 px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${role === "super_admin" ? "bg-navy-900 text-white border-navy-900" : role === "finance" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-sky-50 border-sky-200 text-sky-700"}`}>{role.replace("_", " ")}</span>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" className="px-4 py-2 rounded-full border border-slate-200 text-sm hover:bg-slate-50">View Site →</a>
            <button onClick={doLogout} className="px-4 py-2 rounded-full bg-navy-900 text-white text-sm">Logout</button>
          </div>
        </div>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex gap-2 pb-3 flex-wrap">
          {visibleTabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id as Tab)} className={`px-3 py-2 rounded-full text-xs sm:text-sm font-medium border transition ${tab === t.id ? "bg-navy-900 text-white border-navy-900" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{t.label}</button>
          ))}
        </div>
        {role !== "super_admin" && (
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pb-3">
            <div className="text-xs px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">Limited access — {role} can only manage: {allowed.join(", ")}</div>
          </div>
        )}
      </header>

      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {tab === "dashboard" && <DashboardTab />}
        {tab === "store" && <StoreStockTab />}
        {tab === "alumni" && <AlumniTab />}
        {tab === "leads" && <LeadsTab />}
        {tab === "payments" && <PaymentsTab />}
        {tab === "students" && <StudentsTab />}
        {tab === "finance" && <FinanceTab />}
        {tab === "admissions" && <AdmissionsTab />}
        {tab === "rag" && <RagTab />}
        {tab === "batches" && <BatchesTab />}
        {tab === "banner" && <BannerTab />}
      </main>
    </div>
  );
}

function RagTab() {
  const [list, setList] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ id: "", category: "General", keywords: "", en: "", hi: "", te: "", source: "Admin" });

  const load = () => fetch("/api/admin/rag").then((r) => r.json()).then((d) => Array.isArray(d) && setList(d)).catch(() => {});
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.en && !form.hi && !form.te) return alert("At least one language required");
    const r = await fetch("/api/admin/rag", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (r.ok) { setForm({ id: "", category: "General", keywords: "", en: "", hi: "", te: "", source: "Admin" }); setEditing(null); load(); }
    else alert("Failed");
  };
  const del = async (id: string) => {
    if (!confirm(`Delete ${id}?`)) return;
    await fetch(`/api/admin/rag?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    load();
  };

  const filtered = list.filter((x) => !q || `${x.id} ${x.category} ${x.en}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="grid lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 card p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold text-navy-900">RAG Documents • {list.length}</h2>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="px-3 py-2 rounded-full border border-slate-200 text-sm w-40" />
        </div>
        <div className="mt-4 grid gap-3 max-h-[70vh] overflow-auto pr-1">
          {filtered.map((x) => (
            <div key={x.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white transition">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-navy-900">{x.id} <span className="text-xs font-normal text-slate-500">• {x.category}</span></div>
                  <div className="text-xs text-slate-500 mt-1">Keywords: {Array.isArray(x.keywords) ? x.keywords.join(", ") : x.keywords}</div>
                  <div className="text-sm text-slate-700 mt-2 line-clamp-2">{x.en}</div>
                  <div className="text-xs text-slate-500 mt-1">{x.source}</div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => { setEditing(x.id); setForm({ id: x.id, category: x.category, keywords: Array.isArray(x.keywords) ? x.keywords.join(", ") : x.keywords, en: x.en, hi: x.hi, te: x.te, source: x.source }); }} className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs hover:bg-slate-50">Edit</button>
                  <button onClick={() => del(x.id)} className="px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-xs text-red-700 hover:bg-red-100">Delete</button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="text-sm text-slate-500 text-center py-8">No documents. Add one →</div>}
        </div>
      </div>

      <div className="lg:col-span-5 card p-6 h-fit sticky top-[88px]">
        <h3 className="font-semibold text-navy-900">{editing ? `Edit: ${editing}` : "Add / Update Document"}</h3>
        <p className="text-xs text-slate-500">Bot answers in EN/HI/TE from these chunks. Use keywords for retrieval.</p>
        <div className="mt-4 grid gap-3">
          <input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder="id (e.g., fees, hostel-policy)" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
          <div className="grid grid-cols-2 gap-3">
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
            <input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Source (e.g., Academy → Facilities)" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
          </div>
          <input value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} placeholder="Keywords, comma separated (si, fees, hostel)" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
          <textarea value={form.en} onChange={(e) => setForm({ ...form, en: e.target.value })} placeholder="English answer *" rows={3} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
          <textarea value={form.hi} onChange={(e) => setForm({ ...form, hi: e.target.value })} placeholder="Hindi (hi) — हिंदी में" rows={3} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
          <textarea value={form.te} onChange={(e) => setForm({ ...form, te: e.target.value })} placeholder="Telugu (te) — తెలుగులో" rows={3} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
          <div className="flex gap-2">
            <button onClick={save} className="flex-1 btn-primary justify-center">{editing ? "Update" : "Add"} Document</button>
            <button onClick={() => { setEditing(null); setForm({ id: "", category: "General", keywords: "", en: "", hi: "", te: "", source: "Admin" }); }} className="px-4 py-2.5 rounded-full border border-slate-200 text-sm">Clear</button>
          </div>
          <div className="text-xs text-slate-400">Tip: keep each doc focused (one topic). Bot picks top 2 by keyword overlap.</div>
        </div>
      </div>
    </div>
  );
}

function BatchesTab() {
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState({ id: "", course: "SI", medium: "Telugu", mode: "Residential", startDate: "2026-09-01", seats: 60, filled: 0, duration: "3 Months", status: "open", note: "" });
  const [editing, setEditing] = useState<string | null>(null);

  const load = () => fetch("/api/admin/batches").then((r) => r.json()).then((d) => Array.isArray(d) && setList(d)).catch(() => {});
  useEffect(() => { load(); }, []);

  const save = async () => {
    const r = await fetch("/api/admin/batches", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (r.ok) { setForm({ id: "", course: "SI", medium: "Telugu", mode: "Residential", startDate: "2026-09-01", seats: 60, filled: 0, duration: "3 Months", status: "open", note: "" }); setEditing(null); load(); }
  };
  const del = async (id: string) => {
    if (!confirm(`Delete batch ${id}?`)) return;
    await fetch(`/api/admin/batches?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="grid lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 card p-6">
        <h2 className="font-semibold text-navy-900">Next Batches • {list.length}</h2>
        <div className="mt-4 grid gap-3">
          {list.map((b) => (
            <div key={b.id} className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-navy-900">{b.course} • {b.medium} • {b.mode} <span className={`ml-2 text-xs px-2 py-1 rounded-full border ${b.status === "open" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-100 border-slate-200 text-slate-600"}`}>{b.status}</span></div>
                <div className="text-xs text-slate-600 mt-1">{new Date(b.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} • {b.duration} • {b.seats - b.filled}/{b.seats} seats left</div>
                <div className="text-xs text-slate-500">{b.note}</div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => { setEditing(b.id); setForm(b); }} className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs">Edit</button>
                <button onClick={() => del(b.id)} className="px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-xs text-red-700">Delete</button>
              </div>
            </div>
          ))}
          {list.length === 0 && <div className="text-sm text-slate-500 text-center py-8">No batches yet. Add one →</div>}
        </div>
      </div>

      <div className="lg:col-span-5 card p-6 h-fit sticky top-[88px]">
        <h3 className="font-semibold text-navy-900">{editing ? `Edit: ${editing}` : "Add Batch"}</h3>
        <div className="mt-4 grid gap-3">
          <input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder="id (auto if empty)" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
          <div className="grid grid-cols-3 gap-2">
            <select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm"><option>SI</option><option>Constable</option><option>Groups</option><option>SSC GD</option><option>Defence</option><option>Army</option><option>UPSC</option></select>
            <select value={form.medium} onChange={(e) => setForm({ ...form, medium: e.target.value })} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm"><option>Telugu</option><option>English</option></select>
            <select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm"><option>Residential</option><option>Offline</option><option>Online</option></select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm"><option value="open">open</option><option value="closed">closed</option></select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <input type="number" value={form.seats} onChange={(e) => setForm({ ...form, seats: Number(e.target.value) })} placeholder="Seats" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
            <input type="number" value={form.filled} onChange={(e) => setForm({ ...form, filled: Number(e.target.value) })} placeholder="Filled" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
            <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="Duration" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
          </div>
          <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Note (e.g., Includes hostel + food)" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
          <div className="flex gap-2">
            <button onClick={save} className="flex-1 btn-primary justify-center">{editing ? "Update" : "Add"} Batch</button>
            <button onClick={() => { setEditing(null); setForm({ id: "", course: "SI", medium: "Telugu", mode: "Residential", startDate: "2026-09-01", seats: 60, filled: 0, duration: "3 Months", status: "open", note: "" }); }} className="px-4 py-2.5 rounded-full border border-slate-200 text-sm">Clear</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdmissionsTab() {
  const [list, setList] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [pw, setPw] = useState<Record<string, string>>({});
  const load = () => fetch("/api/admin/admissions").then((r) => r.json()).then((d) => Array.isArray(d) && setList(d)).catch(() => {});
  useEffect(() => { load(); }, []);
  const act = async (id: string, action: string) => {
    const password = pw[id];
    if (action === "approve" && (!password || password.length < 6)) return alert("Enter password (min 6) to create user account");
    const r = await fetch("/api/admin/admissions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action, password }) });
    const data = await r.json();
    if (r.ok) { alert(action === "approve" ? `Approved! User ${data.user.email} created` : `${action} done`); load(); setPw({}); }
    else alert(data.error || "Failed");
  };
  const filtered = list.filter((a) => filter === "all" || a.status === filter);
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold text-navy-900">Admissions • {list.length}</h2>
        <div className="flex gap-1">
          {(["all", "pending", "approved", "rejected"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs border capitalize ${filter === f ? "bg-navy-900 text-white border-navy-900" : "bg-white border-slate-200"}`}>{f} ({f === "all" ? list.length : list.filter((x) => x.status === f).length})</button>
          ))}
        </div>
      </div>
      <div className="mt-4 grid gap-3">
        {filtered.map((a) => (
          <div key={a.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="text-sm font-semibold text-navy-900">{a.name} {a.fatherName ? <span className="font-normal text-slate-600">S/o {a.fatherName}</span> : ""} • {a.phone} <span className="text-xs font-normal text-slate-500">• {a.email}</span></div>
                <div className="text-xs text-slate-600 mt-1">{a.course} {a.courseType ? `• ${a.courseType}` : ""} • {a.medium} • {a.mode} • {a.branch || "—"} {a.batchId ? `• ${a.batchId}` : ""}</div>
                {a.address && <div className="text-xs text-slate-500 mt-1">📍 {a.address} {a.reference ? `• Ref: ${a.reference}` : ""}</div>}
                <div className="text-xs mt-1 flex gap-2 items-center flex-wrap"><span className="capitalize px-2 py-1 rounded-full bg-white border text-xs">{a.paymentMethod}</span>{a.amount && <span className="px-2 py-1 rounded-full bg-white border text-xs">₹{a.amount.toLocaleString("en-IN")}</span>}{a.transactionId && <span className="text-slate-600">Txn: {a.transactionId}</span>}<span className={`px-2 py-1 rounded-full text-xs border ${a.status === "pending" ? "bg-amber-50 border-amber-200 text-amber-700" : a.status === "approved" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>{a.status}</span></div>
                <div className="text-xs text-slate-400 mt-1">{new Date(a.createdAt).toLocaleString("en-IN")} • {a.id}</div>
              </div>
              <div className="shrink-0 text-right">
                {a.screenshot && <a href={a.screenshot} target="_blank" className="text-xs text-sky-700 hover:underline"><img src={a.screenshot} alt="proof" className="w-20 h-14 object-cover rounded-lg border border-slate-200" /><div>View Proof</div></a>}
              </div>
            </div>
            {a.status === "pending" && (
              <div className="mt-3 flex gap-2 items-center">
                <input value={pw[a.id] || ""} onChange={(e) => setPw({ ...pw, [a.id]: e.target.value })} placeholder="Set password for user (min 6)" className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm" />
                <button onClick={() => act(a.id, "approve")} className="px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700">Approve & Create User</button>
                <button onClick={() => act(a.id, "reject")} className="px-3 py-2 rounded-full bg-white border border-slate-200 text-xs hover:bg-slate-50">Reject</button>
              </div>
            )}
            {a.status === "approved" && <div className="mt-2 text-xs text-emerald-700">✓ User account created — student can login at /login with email & password</div>}
            {a.status === "rejected" && <button onClick={() => act(a.id, "pending")} className="mt-2 text-xs px-3 py-1 rounded-full bg-white border">Mark Pending</button>}
          </div>
        ))}
        {filtered.length === 0 && <div className="text-sm text-slate-500 text-center py-8">No {filter} admissions</div>}
      </div>
    </div>
  );
}

function DashboardTab() {
  const [stats, setStats] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  useEffect(() => {
    Promise.all([fetch("/api/admin/payments").then((r) => r.json()).catch(() => null), fetch("/api/admin/expenses").then((r) => r.json()).catch(() => []), fetch("/api/admin/admissions").then((r) => r.json()).catch(() => [])])
      .then(([pay, exp, adm]) => {
        setExpenses(Array.isArray(exp) ? exp : []);
        if (pay?.totals) setStats({ pay, adm: Array.isArray(adm) ? adm : [] });
      });
  }, []);
  if (!stats) return <div className="text-sm text-slate-500">Loading dashboard…</div>;
  const { payments, totals } = stats.pay;
  const pendingAdmissions = stats.adm.filter((a: any) => a.status === "pending").length;
  const totalPayable = expenses.reduce((s: number, e: any) => s + Number(e.amount || 0), 0);
  const paidPayable = expenses.filter((e: any) => e.status === "paid").reduce((s: number, e: any) => s + Number(e.amount || 0), 0);
  const pendingPayable = totalPayable - paidPayable;
  return (
    <div className="grid gap-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5"><div className="text-xs tracking-widest font-semibold text-sky-700">ACCOUNTS RECEIVABLE</div><div className="text-2xl font-bold text-navy-900 mt-1">₹{totals.totalReceivable.toLocaleString("en-IN")}</div><div className="text-xs text-slate-500">Total fees receivable • {totals.count} admissions</div><div className="mt-3 flex gap-2 text-xs"><span className="px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">Collected ₹{totals.totalCollected.toLocaleString("en-IN")}</span><span className="px-2 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700">Pending ₹{totals.totalPending.toLocaleString("en-IN")}</span></div></div>
        <div className="card p-5"><div className="text-xs tracking-widest font-semibold text-amber-700">ACCOUNTS PAYABLE</div><div className="text-2xl font-bold text-navy-900 mt-1">₹{totalPayable.toLocaleString("en-IN")}</div><div className="text-xs text-slate-500">{expenses.length} expenses</div><div className="mt-3 flex gap-2 text-xs"><span className="px-2 py-1 rounded-full bg-slate-100 border">Paid ₹{paidPayable.toLocaleString("en-IN")}</span><span className="px-2 py-1 rounded-full bg-red-50 border border-red-200 text-red-700">Due ₹{pendingPayable.toLocaleString("en-IN")}</span></div></div>
        <div className="card p-5"><div className="text-xs tracking-widest font-semibold text-emerald-700">NET POSITION</div><div className={`text-2xl font-bold mt-1 ${totals.totalCollected - totalPayable >= 0 ? "text-emerald-700" : "text-red-600"}`}>₹{(totals.totalCollected - totalPayable).toLocaleString("en-IN")}</div><div className="text-xs text-slate-500">Collected - Payable</div><div className="mt-3 text-xs text-slate-500">Profitability at a glance</div></div>
        <div className="card p-5"><div className="text-xs tracking-widest font-semibold text-violet-700">STUDENTS & ADMISSIONS</div><div className="text-2xl font-bold text-navy-900 mt-1">{stats.pay.usersCount} <span className="text-sm font-normal text-slate-500">students</span></div><div className="text-xs text-slate-500">{pendingAdmissions} pending admissions • {payments.filter((p: any) => p.paymentMethod === "cash").length} cash</div><div className="mt-3 flex gap-2 text-xs"><span className="px-2 py-1 rounded-full bg-white border">UPI: {payments.filter((p: any) => p.paymentMethod === "upi").length}</span><span className="px-2 py-1 rounded-full bg-white border">Bank: {payments.filter((p: any) => p.paymentMethod === "bank").length}</span></div></div>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-5"><div className="font-semibold text-navy-900">Recent Payments</div><div className="mt-3 grid gap-2">{payments.slice(0, 5).map((p: any) => (<div key={p.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50"><div><div className="text-sm font-medium text-navy-900">{p.student} • {p.course}</div><div className="text-xs text-slate-500">{p.paymentMethod} • {p.status} • ₹{p.amount.toLocaleString("en-IN")}</div></div><span className={`text-xs px-2 py-1 rounded-full border ${p.collected ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-amber-50 border-amber-200 text-amber-700"}`}>{p.collected ? "Collected" : "Pending"}</span></div>))}{payments.length === 0 && <div className="text-sm text-slate-500">No payments yet</div>}</div></div>
        <div className="card p-5"><div className="font-semibold text-navy-900">Top Payables (AP)</div><div className="mt-3 grid gap-2">{expenses.slice(0, 5).map((e: any) => (<div key={e.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200"><div><div className="text-sm font-medium text-navy-900">{e.title}</div><div className="text-xs text-slate-500">{e.category} • {e.vendor} • Due {e.dueDate}</div></div><span className={`text-xs px-2 py-1 rounded-full border ${e.status === "paid" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-amber-50 border-amber-200 text-amber-700"}`}>₹{e.amount.toLocaleString("en-IN")} • {e.status}</span></div>))}{expenses.length === 0 && <div className="text-sm text-slate-500">No expenses</div>}</div></div>
      </div>
    </div>
  );
}

function PaymentsTab() {
  const [data, setData] = useState<any>(null);
  const [filter, setFilter] = useState<"all" | "collected" | "pending">("all");
  const [q, setQ] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("new");
  const [newPay, setNewPay] = useState({ name: "", phone: "", email: "", course: "SI", medium: "Telugu", mode: "Offline", amount: 0, paidAmount: 0, dueDate: "", paymentMethod: "cash", transactionId: "", password: "", fatherName: "", address: "", branch: "Warangal", courseType: "Regular" });
  const load = () => fetch("/api/admin/payments").then((r) => r.json()).then((d) => setData(d)).catch(() => {});
  const loadStudents = () => fetch("/api/admin/students").then((r) => r.json()).then((d) => Array.isArray(d) && setStudents(d)).catch(() => {});
  useEffect(() => { load(); loadStudents(); }, []);
  useEffect(() => {
    if (selectedStudent === "new") {
      setNewPay({ name: "", phone: "", email: "", course: "SI", medium: "Telugu", mode: "Offline", amount: 0, paidAmount: 0, dueDate: "", paymentMethod: "cash", transactionId: "", password: "", fatherName: "", address: "", branch: "Warangal", courseType: "Regular" });
    } else {
      const s = students.find((x) => x.id === selectedStudent);
      if (s) setNewPay({ name: s.name, phone: s.phone, email: s.email, course: s.course, medium: s.medium, mode: s.mode, amount: 0, paidAmount: 0, dueDate: "", paymentMethod: "cash", transactionId: "", password: "", fatherName: s.fatherName || "", address: s.address || "", branch: s.branch || "Warangal", courseType: s.courseType || "Regular" });
    }
  }, [selectedStudent, students]);
  const create = async () => {
    if (!newPay.name.trim() || !newPay.phone.trim() || !newPay.email.trim() || !newPay.amount) return alert("Name, phone, email, amount required");
    if (selectedStudent === "new" && !newPay.password.trim()) {
      // for new student, password will be auto-generated if not provided, but require at least 6 if provided
      // allow auto generation
    }
    const payload: any = { ...newPay, studentId: selectedStudent, createStudent: selectedStudent === "new", password: newPay.password };
    const r = await fetch("/api/admin/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const d = await r.json();
    if (r.ok) {
      if (d.studentId && selectedStudent === "new") alert(`Payment added! Student created: ${d.generatedPassword ? `Password: ${d.generatedPassword}` : ""}. Check Students tab.`);
      setNewPay({ name: "", phone: "", email: "", course: "SI", medium: "Telugu", mode: "Offline", amount: 0, paidAmount: 0, dueDate: "", paymentMethod: "cash", transactionId: "", password: "", fatherName: "", address: "", branch: "Warangal", courseType: "Regular" }); setSelectedStudent("new"); setShowAdd(false); load(); loadStudents();
    } else alert(d.error || "Failed");
  };
  if (!data) return <div className="text-sm text-slate-500">Loading payments…</div>;
  const payments = data.payments.filter((p: any) => {
    const okFilter = filter === "all" || (filter === "collected" ? p.collected : !p.collected);
    const okQ = !q || `${p.student} ${p.email} ${p.phone} ${p.course} ${p.transactionId || ""}`.toLowerCase().includes(q.toLowerCase());
    return okFilter && okQ;
  });
  return (
    <div className="card p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="font-semibold text-navy-900">Payments • ₹{data.totals.totalCollected.toLocaleString("en-IN")} collected / ₹{data.totals.totalReceivable.toLocaleString("en-IN")} receivable</h2>
        <div className="flex gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search student, txn…" className="px-3 py-2 rounded-full border border-slate-200 text-sm w-32" />
          <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="px-3 py-2 rounded-full border border-slate-200 text-sm"><option value="all">All</option><option value="collected">Collected</option><option value="pending">Pending</option></select>
          <button onClick={() => setShowAdd(!showAdd)} className="px-4 py-2 rounded-full bg-navy-900 text-white text-sm">{showAdd ? "Close" : "+ Add Payment"}</button>
        </div>
      </div>
      {showAdd && (
        <div className="mt-4 p-4 rounded-2xl border border-slate-200 bg-slate-50 grid gap-3">
          <div>
            <label className="text-xs font-medium text-slate-700">Student *</label>
            <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white">
              <option value="new">+ New Student — enter details below</option>
              {students.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name} • {s.email} • {s.phone} • {s.course}</option>
              ))}
            </select>
            <div className="text-xs text-slate-500 mt-1">{selectedStudent === "new" ? "New student will be auto-created in Students tab (password required)" : "Existing student — payment will be linked, student auto-created if missing"}</div>
          </div>
          <div className="grid sm:grid-cols-3 gap-2">
            <input value={newPay.name} onChange={(e) => setNewPay({ ...newPay, name: e.target.value })} placeholder="Student Name *" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
            <input value={newPay.phone} onChange={(e) => setNewPay({ ...newPay, phone: e.target.value })} placeholder="Phone * (10 digits)" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
            <input value={newPay.email} onChange={(e) => setNewPay({ ...newPay, email: e.target.value })} placeholder="Email *" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
          </div>
          {selectedStudent === "new" && (
            <div className="grid sm:grid-cols-3 gap-2">
              <input value={newPay.fatherName} onChange={(e) => setNewPay({ ...newPay, fatherName: e.target.value })} placeholder="Father Name" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input value={newPay.address} onChange={(e) => setNewPay({ ...newPay, address: e.target.value })} placeholder="Address" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input value={newPay.password} onChange={(e) => setNewPay({ ...newPay, password: e.target.value })} placeholder="Password * (for new student, min 6)" type="password" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
            </div>
          )}
          <div className="grid sm:grid-cols-4 gap-2">
            <select value={newPay.course} onChange={(e) => setNewPay({ ...newPay, course: e.target.value })} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm"><option>SI</option><option>Constable</option><option>Groups</option><option>SSC GD</option><option>Defence</option><option>UPSC</option></select>
            <select value={newPay.medium} onChange={(e) => setNewPay({ ...newPay, medium: e.target.value })} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm"><option>Telugu</option><option>English</option></select>
            <select value={newPay.mode} onChange={(e) => setNewPay({ ...newPay, mode: e.target.value })} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm"><option>Residential</option><option>Offline</option><option>Online</option></select>
            <input type="number" value={newPay.amount} onChange={(e) => setNewPay({ ...newPay, amount: Number(e.target.value) })} placeholder="Amount * (₹)" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            <div><label className="text-xs text-slate-500">Paid Amount (₹) — leave 0 for full</label><input type="number" value={newPay.paidAmount} onChange={(e) => setNewPay({ ...newPay, paidAmount: Number(e.target.value) })} placeholder="e.g., 10000" className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" /></div>
            <div><label className="text-xs text-slate-500">Due Date (future dues)</label><input type="date" value={newPay.dueDate} onChange={(e) => setNewPay({ ...newPay, dueDate: e.target.value })} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            <select value={newPay.paymentMethod} onChange={(e) => setNewPay({ ...newPay, paymentMethod: e.target.value })} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm"><option value="cash">Cash</option><option value="upi">UPI</option><option value="bank">Bank Transfer</option></select>
            <input value={newPay.transactionId} onChange={(e) => setNewPay({ ...newPay, transactionId: e.target.value })} placeholder="Transaction ID (for UPI/Bank)" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
          </div>
          <div className="text-xs text-slate-500">Balance = Amount - Paid. If Paid &lt; Amount, shows as future dues with due date.</div>
          <button onClick={create} className="btn-primary justify-center">Add Payment →</button>
        </div>
      )}
      <div className="mt-4 overflow-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-xs text-slate-500 border-b"><th className="text-left py-2">Student</th><th className="text-left">Course</th><th className="text-left">Method</th><th className="text-left">Txn</th><th className="text-right">Amount</th><th className="text-right">Paid</th><th className="text-right">Balance</th><th className="text-center">Due</th><th className="text-center">Status</th></tr></thead>
          <tbody>
            {payments.map((p: any) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="py-3"><div className="font-medium text-navy-900">{p.student}</div><div className="text-xs text-slate-500">{p.email} • {p.phone}</div></td>
                <td>{p.course} • {p.mode}</td>
                <td className="capitalize">{p.paymentMethod} {p.screenshot ? "• 📎" : ""}</td>
                <td className="text-xs">{p.transactionId || "—"}</td>
                <td className="text-right font-medium">₹{p.amount.toLocaleString("en-IN")}</td>
                <td className="text-right text-emerald-700">₹{p.paidAmount.toLocaleString("en-IN")}</td>
                <td className={`text-right font-bold ${p.balance > 0 ? "text-amber-700" : "text-emerald-700"}`}>₹{p.balance.toLocaleString("en-IN")}</td>
                <td className="text-center text-xs">{p.dueDate ? new Date(p.dueDate).toLocaleDateString("en-IN") : "—"}</td>
                <td className="text-center"><span className={`px-2 py-1 rounded-full text-xs border ${p.balance === 0 ? "bg-emerald-50 border-emerald-200 text-emerald-700" : p.balance < p.amount ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-red-50 border-red-200 text-red-700"}`}>{p.balance === 0 ? "paid" : p.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {payments.length === 0 && <div className="text-center py-8 text-sm text-slate-500">No payments match</div>}
        <div className="mt-3 text-xs text-slate-500">Balance = Future dues — Amount - Paid. Use AR dashboard for total pending.</div>
      </div>
    </div>
  );
}

function StudentsTab() {
  const [list, setList] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [pw, setPw] = useState<Record<string, string>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newStu, setNewStu] = useState({ name: "", fatherName: "", email: "", phone: "", address: "", branch: "Warangal", course: "SI", courseType: "Regular", medium: "Telugu", mode: "Residential", password: "" });
  const load = () => fetch("/api/admin/students").then((r) => r.json()).then((d) => Array.isArray(d) && setList(d)).catch(() => {});
  useEffect(() => { load(); }, []);
  const act = async (id: string, action: string, extra: any = {}) => {
    const r = await fetch("/api/admin/students", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action, ...extra }) });
    const data = await r.json();
    if (r.ok) load();
    else alert(data.error || "Failed");
  };
  const create = async () => {
    if (!newStu.name.trim() || !newStu.email.trim() || !newStu.phone.trim() || !newStu.password.trim()) return alert("Name, email, phone, password required");
    const r = await fetch("/api/admin/students", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create", ...newStu }) });
    const data = await r.json();
    if (r.ok) { setNewStu({ name: "", fatherName: "", email: "", phone: "", address: "", branch: "Warangal", course: "SI", courseType: "Regular", medium: "Telugu", mode: "Residential", password: "" }); setShowAdd(false); load(); }
    else alert(data.error || "Failed");
  };
  const filtered = list.filter((u) => !q || `${u.name} ${u.email} ${u.phone} ${u.course}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold text-navy-900">Students • {list.length} accounts</h2>
        <div className="flex gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email…" className="px-3 py-2 rounded-full border border-slate-200 text-sm w-40" />
          <button onClick={() => setShowAdd(!showAdd)} className="px-4 py-2 rounded-full bg-navy-900 text-white text-sm">{showAdd ? "Close" : "+ Add Student"}</button>
        </div>
      </div>
      {showAdd && (
        <div className="mt-4 p-4 rounded-2xl border border-slate-200 bg-slate-50 grid gap-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <input value={newStu.name} onChange={(e) => setNewStu({ ...newStu, name: e.target.value })} placeholder="Full Name *" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
            <input value={newStu.fatherName} onChange={(e) => setNewStu({ ...newStu, fatherName: e.target.value })} placeholder="Father Name" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <input value={newStu.email} onChange={(e) => setNewStu({ ...newStu, email: e.target.value })} placeholder="Email * (login ID)" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
            <input value={newStu.phone} onChange={(e) => setNewStu({ ...newStu, phone: e.target.value })} placeholder="Phone * (10 digits)" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
          </div>
          <input value={newStu.address} onChange={(e) => setNewStu({ ...newStu, address: e.target.value })} placeholder="Address" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
          <div className="grid sm:grid-cols-3 gap-2">
            <select value={newStu.branch} onChange={(e) => setNewStu({ ...newStu, branch: e.target.value })} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm"><option>Warangal</option><option>Hyderabad</option><option>Hanamkonda</option><option>Bollikunta (Residential)</option></select>
            <select value={newStu.course} onChange={(e) => setNewStu({ ...newStu, course: e.target.value })} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm"><option>SI</option><option>Constable</option><option>Groups</option><option>SSC GD</option><option>Defence</option><option>Army</option><option>UPSC</option></select>
            <input value={newStu.password} onChange={(e) => setNewStu({ ...newStu, password: e.target.value })} placeholder="Password * (min 6)" type="password" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
          </div>
          <div className="grid sm:grid-cols-3 gap-2">
            <select value={newStu.courseType} onChange={(e) => setNewStu({ ...newStu, courseType: e.target.value })} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm"><option>Regular</option><option>Crash</option><option>Weekend</option><option>Online</option></select>
            <select value={newStu.medium} onChange={(e) => setNewStu({ ...newStu, medium: e.target.value })} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm"><option>Telugu</option><option>English</option></select>
            <select value={newStu.mode} onChange={(e) => setNewStu({ ...newStu, mode: e.target.value })} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm"><option>Residential</option><option>Offline</option><option>Online</option></select>
          </div>
          <button onClick={create} className="btn-primary justify-center">Create Student →</button>
        </div>
      )}
      <div className="mt-4 grid gap-3">
        {filtered.map((u) => (
          <div key={u.id} className="p-4 rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-navy-900">{u.name} <span className={`ml-2 text-xs px-2 py-1 rounded-full border ${u.active === false ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>{u.active === false ? "disabled" : "active"}</span></div>
                <div className="text-xs text-slate-600 mt-1">{u.email} • {u.phone} • {u.course} • {u.medium} • {u.mode}</div>
                <div className="text-xs text-slate-400">Created {new Date(u.createdAt).toLocaleDateString("en-IN")} • {u.id}</div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => act(u.id, "toggleActive", { active: u.active === false ? true : false })} className="px-3 py-1.5 rounded-full border text-xs bg-white hover:bg-slate-50">{u.active === false ? "Enable" : "Disable"}</button>
                <button onClick={() => { if (confirm(`Delete ${u.email}?`)) act(u.id, "delete"); }} className="px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-xs text-red-700">Delete</button>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <input value={pw[u.id] || ""} onChange={(e) => setPw({ ...pw, [u.id]: e.target.value })} placeholder="New password (min 6)" className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm" />
              <button onClick={() => act(u.id, "resetPassword", { password: pw[u.id] })} className="px-4 py-2 rounded-full bg-navy-900 text-white text-xs">Reset PW</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-sm text-slate-500 text-center py-8">No students</div>}
      </div>
    </div>
  );
}

function FinanceTab() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [payments, setPayments] = useState<any>(null);
  const [form, setForm] = useState({ title: "", category: "Rent", amount: 0, dueDate: new Date().toISOString().slice(0, 10), status: "pending", vendor: "", notes: "" });
  const loadExp = () => fetch("/api/admin/expenses").then((r) => r.json()).then((d) => Array.isArray(d) && setExpenses(d)).catch(() => {});
  const loadPay = () => fetch("/api/admin/payments").then((r) => r.json()).then((d) => setPayments(d)).catch(() => {});
  useEffect(() => { loadExp(); loadPay(); }, []);
  const save = async () => {
    if (!form.title || !form.amount) return alert("Title and amount required");
    const r = await fetch("/api/admin/expenses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (r.ok) { setForm({ title: "", category: "Rent", amount: 0, dueDate: new Date().toISOString().slice(0, 10), status: "pending", vendor: "", notes: "" }); loadExp(); }
  };
  const togglePaid = async (e: any) => {
    await fetch("/api/admin/expenses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...e, status: e.status === "paid" ? "pending" : "paid" }) });
    loadExp();
  };
  const del = async (id: string) => {
    if (!confirm("Delete expense?")) return;
    await fetch(`/api/admin/expenses?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    loadExp();
  };
  const totalReceivable = payments?.totals.totalReceivable || 0;
  const totalCollected = payments?.totals.totalCollected || 0;
  const totalPayable = expenses.reduce((s: number, e: any) => s + Number(e.amount), 0);
  const paidPayable = expenses.filter((e: any) => e.status === "paid").reduce((s: number, e: any) => s + Number(e.amount), 0);
  return (
    <div className="grid lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7">
        <div className="card p-6">
          <h3 className="font-semibold text-navy-900">AR — Accounts Receivable (Fees)</h3>
          <div className="mt-4 grid sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-slate-50 border"><div className="text-xs text-slate-500">Receivable</div><div className="text-lg font-bold text-navy-900">₹{totalReceivable.toLocaleString("en-IN")}</div></div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200"><div className="text-xs text-emerald-700">Collected</div><div className="text-lg font-bold text-emerald-700">₹{totalCollected.toLocaleString("en-IN")}</div></div>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200"><div className="text-xs text-amber-700">Pending</div><div className="text-lg font-bold text-amber-700">₹{(totalReceivable - totalCollected).toLocaleString("en-IN")}</div></div>
          </div>
          <div className="mt-4 text-xs text-slate-500">Receivable = sum of all admission fees (course+mode). Collected = approved admissions (or UPI/Bank with txn). Pending = Receivable - Collected.</div>
        </div>
        <div className="card p-6 mt-4">
          <h3 className="font-semibold text-navy-900">AP — Accounts Payable (Expenses)</h3>
          <div className="mt-3 grid gap-2 max-h-[50vh] overflow-auto pr-1">
            {expenses.map((e) => (
              <div key={e.id} className="p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3 bg-white">
                <div><div className="text-sm font-medium text-navy-900">{e.title}</div><div className="text-xs text-slate-500">{e.category} • {e.vendor} • Due {e.dueDate} • ₹{e.amount.toLocaleString("en-IN")}</div></div>
                <div className="flex gap-1">
                  <button onClick={() => togglePaid(e)} className={`px-3 py-1.5 rounded-full text-xs border ${e.status === "paid" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-amber-50 border-amber-200 text-amber-700"}`}>{e.status}</button>
                  <button onClick={() => del(e.id)} className="px-2 py-1.5 rounded-full bg-red-50 border border-red-200 text-xs text-red-700">✕</button>
                </div>
              </div>
            ))}
            {expenses.length === 0 && <div className="text-sm text-slate-500">No payables</div>}
          </div>
        </div>
      </div>
      <div className="lg:col-span-5 card p-6 h-fit">
        <h3 className="font-semibold text-navy-900">Add Payable (AP)</h3>
        <div className="mt-4 grid gap-3">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title (e.g., Campus Rent - Sep)" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm"><option>Rent</option><option>Faculty</option><option>Utilities</option><option>Marketing</option><option>Maintenance</option><option>Other</option></select>
            <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} placeholder="Amount" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm"><option value="pending">pending</option><option value="paid">paid</option></select>
          </div>
          <input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} placeholder="Vendor / Payee" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
          <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
          <button onClick={save} className="btn-primary justify-center">Add Payable →</button>
          <div className="p-3 rounded-xl bg-slate-50 border text-xs text-slate-600"><b>Net:</b> ₹{(totalCollected - totalPayable).toLocaleString("en-IN")} (Collected - Payable) • Paid Payables: ₹{paidPayable.toLocaleString("en-IN")} • Due: ₹{(totalPayable - paidPayable).toLocaleString("en-IN")}</div>
        </div>
      </div>
    </div>
  );
}

function LeadsTab() {
  const [list, setList] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "new" | "contacted" | "converted">("all");
  const load = () => fetch("/api/admin/leads").then((r) => r.json()).then((d) => Array.isArray(d) && setList(d)).catch(() => {});
  useEffect(() => { load(); }, []);
  const update = async (id: string, status: string) => {
    await fetch("/api/admin/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    load();
  };
  const del = async (id: string) => {
    if (!confirm("Delete lead?")) return;
    await fetch(`/api/admin/leads?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    load();
  };
  const filtered = list.filter((x) => filter === "all" || x.status === filter);
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold text-navy-900">Join Leads • {list.length}</h2>
        <div className="flex gap-1">
          {(["all", "new", "contacted", "converted"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs border capitalize ${filter === f ? "bg-navy-900 text-white border-navy-900" : "bg-white border-slate-200"}`}>{f} ({f === "all" ? list.length : list.filter((x) => x.status === f).length})</button>
          ))}
        </div>
      </div>
      <div className="mt-1 text-xs text-slate-500">From Home → “Find your batch” → Join (name + mobile)</div>
      <div className="mt-4 grid gap-3">
        {filtered.map((x) => (
          <div key={x.id} className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-navy-900">{x.name} • <a href={`tel:${x.phone}`} className="text-sky-700 hover:underline">{x.phone}</a></div>
              <div className="text-xs text-slate-600 mt-1">{x.course} • {x.medium} • {x.mode} {x.batchId ? `• ${x.batchId}` : ""}</div>
              <div className="text-xs text-slate-400 mt-1">{new Date(x.createdAt).toLocaleString("en-IN")} • {x.id} • <span className={`px-2 py-1 rounded-full border text-xs ${x.status === "new" ? "bg-amber-50 border-amber-200 text-amber-700" : x.status === "contacted" ? "bg-sky-50 border-sky-200 text-sky-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>{x.status}</span></div>
            </div>
            <div className="flex gap-1 shrink-0">
              <a href={`tel:${x.phone}`} className="px-3 py-1.5 rounded-full bg-emerald-600 text-white text-xs">Call</a>
              <select value={x.status} onChange={(e) => update(x.id, e.target.value)} className="px-2 py-1.5 rounded-full border border-slate-200 text-xs bg-white">
                <option value="new">new</option>
                <option value="contacted">contacted</option>
                <option value="converted">converted</option>
              </select>
              <button onClick={() => del(x.id)} className="px-2 py-1.5 rounded-full bg-red-50 border border-red-200 text-xs text-red-700">✕</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-sm text-slate-500 text-center py-8">No {filter} leads yet — they appear here when someone clicks Join on home.</div>}
      </div>
    </div>
  );
}

function AlumniTab() {
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState({ id: "", name: "", role: "", batch: "", course: "Constable", quote: "", video: "", image: "", featured: false });
  const [editing, setEditing] = useState<string | null>(null);
  const load = () => fetch("/api/admin/alumni").then((r) => r.json()).then((d) => Array.isArray(d) && setList(d)).catch(() => {});
  useEffect(() => { load(); }, []);
  const save = async () => {
    if (!form.name.trim() || !form.quote.trim()) return alert("Name and quote required");
    const r = await fetch("/api/admin/alumni", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (r.ok) { setForm({ id: "", name: "", role: "", batch: "", course: "Constable", quote: "", video: "", image: "", featured: false }); setEditing(null); load(); }
    else alert("Failed");
  };
  const del = async (id: string) => {
    if (!confirm("Delete alumni?")) return;
    await fetch(`/api/admin/alumni?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    load();
  };
  return (
    <div className="grid lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 card p-6">
        <h2 className="font-semibold text-navy-900">Alumni • {list.length} testimonials</h2>
        <p className="text-xs text-slate-500">From https://ayaaninstitute.in/ — manages /alumni page</p>
        <div className="mt-4 grid gap-3 max-h-[70vh] overflow-auto pr-1">
          {list.map((a) => (
            <div key={a.id} className="p-4 rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-navy-900">{a.name} <span className="text-xs font-normal text-slate-500">• {a.role}</span> {a.featured && <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700">Featured</span>}</div>
                  <div className="text-xs text-slate-500 mt-1">{a.batch} • {a.course} • {a.createdAt}</div>
                  <div className="text-sm text-slate-700 mt-2 line-clamp-2">“{a.quote}”</div>
                  {a.video && <div className="text-xs text-sky-700 mt-1 truncate">▶ {a.video}</div>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => { setEditing(a.id); setForm({ id: a.id, name: a.name, role: a.role, batch: a.batch, course: a.course, quote: a.quote, video: a.video, image: a.image, featured: !!a.featured }); }} className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs">Edit</button>
                  <button onClick={() => del(a.id)} className="px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-xs text-red-700">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="lg:col-span-5 card p-6 h-fit sticky top-[88px]">
        <h3 className="font-semibold text-navy-900">{editing ? `Edit: ${editing}` : "Add Alumni"}</h3>
        <div className="mt-4 grid gap-3">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name *" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
          <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Role (e.g., Constable — Selected)" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
          <div className="grid grid-cols-2 gap-3">
            <input value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })} placeholder="Batch (e.g., 2020 • Warangal)" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
            <select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm"><option>Constable</option><option>SI</option><option>Groups</option><option>SSC GD</option><option>Defence</option><option>UPSC</option><option>General</option></select>
          </div>
          <textarea value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} placeholder="Quote * — testimonial text" rows={4} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
          <input value={form.video} onChange={(e) => setForm({ ...form, video: e.target.value })} placeholder="YouTube link (e.g., https://www.youtube.com/watch?v=...)" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
          <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="Image URL (or leave blank)" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured on home</label>
          <div className="flex gap-2">
            <button onClick={save} className="flex-1 btn-primary justify-center">{editing ? "Update" : "Add"} Alumni</button>
            <button onClick={() => { setEditing(null); setForm({ id: "", name: "", role: "", batch: "", course: "Constable", quote: "", video: "", image: "", featured: false }); }} className="px-4 py-2.5 rounded-full border border-slate-200 text-sm">Clear</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StoreStockTab() {
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState({ id: "", name: "", price: 0, category: "Gear", stock: 0, threshold: 5, sku: "", image: "" });
  const [editing, setEditing] = useState<string | null>(null);
  const load = () => fetch("/api/admin/store").then((r) => r.json()).then((d) => Array.isArray(d) && setList(d)).catch(() => {});
  useEffect(() => { load(); }, []);
  const save = async () => {
    if (!form.name.trim() || !form.price) return alert("Name and price required");
    const r = await fetch("/api/admin/store", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (r.ok) { setForm({ id: "", name: "", price: 0, category: "Gear", stock: 0, threshold: 5, sku: "", image: "" }); setEditing(null); load(); }
  };
  const quick = async (id: string, delta: number) => { await fetch("/api/admin/store", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, delta }) }); load(); };
  const setStock = async (id: string, stock: number) => { await fetch("/api/admin/store", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, stock }) }); load(); };
  const del = async (id: string) => { if (!confirm("Delete item?")) return; await fetch(`/api/admin/store?id=${encodeURIComponent(id)}`, { method: "DELETE" }); load(); };
  const low = list.filter((x) => x.stock > 0 && x.stock <= x.threshold).length;
  const out = list.filter((x) => x.stock === 0).length;
  return (
    <div className="grid lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-navy-900">Store Stock • {list.length} items</h2>
          <div className="flex gap-2 text-xs"><span className="px-2 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700">{low} low</span><span className="px-2 py-1 rounded-full bg-red-50 border border-red-200 text-red-700">{out} out</span></div>
        </div>
        <div className="mt-4 grid gap-3 max-h-[70vh] overflow-auto pr-1">
          {list.map((it) => (
            <div key={it.id} className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-3">
              <div className="flex-1">
                <div className="text-sm font-semibold text-navy-900">{it.name} <span className="text-xs font-normal text-slate-500">• {it.category} • {it.sku}</span></div>
                <div className="text-sm font-bold text-navy-900">₹{it.price.toLocaleString("en-IN")} • <span className={`text-xs px-2 py-1 rounded-full border ${it.stock === 0 ? "bg-red-50 border-red-200 text-red-700" : it.stock <= it.threshold ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>{it.stock === 0 ? "Out" : it.stock <= it.threshold ? `Low: ${it.stock}` : `In: ${it.stock}`}</span></div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => quick(it.id, -1)} className="w-8 h-8 rounded-full border border-slate-200 grid place-items-center hover:bg-slate-50">−</button>
                <input type="number" value={it.stock} onChange={(e) => setStock(it.id, Number(e.target.value))} className="w-16 px-2 py-1 rounded-full border border-slate-200 text-center text-sm" />
                <button onClick={() => quick(it.id, 1)} className="w-8 h-8 rounded-full border border-slate-200 grid place-items-center hover:bg-slate-50">+</button>
                <button onClick={() => { setEditing(it.id); setForm(it); }} className="ml-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs">Edit</button>
                <button onClick={() => del(it.id)} className="px-2 py-1.5 rounded-full bg-red-50 border border-red-200 text-xs text-red-700">✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="lg:col-span-5 card p-6 h-fit">
        <h3 className="font-semibold text-navy-900">{editing ? `Edit: ${editing}` : "Add / Update Item"}</h3>
        <div className="mt-4 grid gap-3">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name *" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
          <div className="grid grid-cols-3 gap-2">
            <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} placeholder="Price" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm"><option>Footwear</option><option>Apparel</option><option>Gear</option><option>Equipment</option><option>Fitness</option><option>General</option></select>
            <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="SKU" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-xs text-slate-500">Stock</label><input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" /></div>
            <div><label className="text-xs text-slate-500">Low threshold</label><input type="number" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: Number(e.target.value) })} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" /></div>
          </div>
          <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="Image URL (optional)" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
          <div className="flex gap-2">
            <button onClick={save} className="flex-1 btn-primary justify-center">{editing ? "Update" : "Add"} Item</button>
            <button onClick={() => { setEditing(null); setForm({ id: "", name: "", price: 0, category: "Gear", stock: 0, threshold: 5, sku: "", image: "" }); }} className="px-4 py-2.5 rounded-full border border-slate-200 text-sm">Clear</button>
          </div>
          <div className="text-xs text-slate-400">Stock 0 = Out of stock (button disabled on store). Low stock shows amber badge.</div>
        </div>
      </div>
    </div>
  );
}

function BannerTab() {
  const [data, setData] = useState({ enabled: false, message: "", type: "info", link: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => { fetch("/api/admin/banner").then((r) => r.json()).then((d) => setData({ enabled: !!d.enabled, message: d.message || "", type: d.type || "info", link: d.link || "" })).catch(() => {}); }, []);

  const save = async () => {
    const r = await fetch("/api/admin/banner", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (r.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      // notify banner in all tabs immediately (no 10s wait)
      try {
        localStorage.setItem("ayaan_banner_updated", Date.now().toString());
        window.dispatchEvent(new Event("ayaan_banner_updated"));
        // clear dismissed so new state shows instantly
        if (!data.enabled) {
          sessionStorage.removeItem("ayaan_banner_dismissed");
          sessionStorage.removeItem("ayaan_banner_dismissed_key");
        }
      } catch {}
    }
  };

  const bg = data.type === "urgent" ? "bg-red-600" : data.type === "warning" ? "bg-amber-500" : data.type === "success" ? "bg-emerald-600" : "bg-navy-900";

  return (
    <div className="grid lg:grid-cols-12 gap-6">
      <div className="lg:col-span-5 card p-6 h-fit">
        <h2 className="font-semibold text-navy-900">Rolling Banner</h2>
        <p className="text-sm text-slate-500">Toggle on → banner appears site-wide (top). Turn off to hide.</p>

        <div className="mt-6 flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50">
          <div>
            <div className="text-sm font-semibold text-navy-900">Banner Enabled</div>
            <div className="text-xs text-slate-500">Only when ON, banner pops up</div>
          </div>
          <button onClick={() => setData({ ...data, enabled: !data.enabled })} className={`w-12 h-7 rounded-full p-1 transition ${data.enabled ? "bg-emerald-500" : "bg-slate-300"}`}>
            <span className={`block w-5 h-5 rounded-full bg-white shadow transition ${data.enabled ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>

        <div className="mt-4 grid gap-3">
          <label className="text-xs font-medium text-slate-600">Message * (max 300 chars)</label>
          <textarea value={data.message} onChange={(e) => setData({ ...data, message: e.target.value })} placeholder="e.g., Admissions Open for SI & Constable — Free Demo on 1st Sep! Call +91 8886667222" rows={3} maxLength={300} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
          <div className="text-xs text-slate-400 text-right">{data.message.length}/300</div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600">Type</label>
              <select value={data.type} onChange={(e) => setData({ ...data, type: e.target.value })} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm">
                <option value="info">info (navy)</option>
                <option value="warning">warning (amber)</option>
                <option value="success">success (green)</option>
                <option value="urgent">urgent (red)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Link (optional)</label>
              <input value={data.link} onChange={(e) => setData({ ...data, link: e.target.value })} placeholder="/contact or https://..." className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
            </div>
          </div>

          <button onClick={save} className="btn-primary justify-center">Save Banner →</button>
          {saved && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl text-center">Saved! Refresh site to see.</div>}
        </div>
      </div>

      <div className="lg:col-span-7">
        <div className="card p-6">
          <div className="text-sm font-semibold text-navy-900">Preview (as on website top)</div>
          <div className={`mt-4 rounded-2xl overflow-hidden border ${data.enabled ? "border-slate-200" : "border-dashed border-slate-300 opacity-60"}`}>
            {data.enabled && data.message ? (
              <div className={`${bg} text-white px-4 py-3 flex items-center gap-3 text-sm`}>
                <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-semibold">UPDATE</span>
                <span className="flex-1 truncate">{data.message}</span>
                {data.link && <span className="px-3 py-1.5 rounded-full bg-white text-navy-900 text-xs font-semibold hidden sm:inline-flex">View →</span>}
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-sm text-slate-500">{data.enabled ? "Enter a message to preview" : "Banner is OFF — turn on to preview"}</div>
            )}
          </div>
          <div className="mt-4 text-xs text-slate-500">Banner is dismissible per session (X stores in sessionStorage). It reappears on new visit if still enabled.</div>
        </div>

        <div className="card p-6 mt-4">
          <div className="text-sm font-semibold text-navy-900">How it works</div>
          <ul className="mt-2 grid gap-1 text-sm text-slate-600">
            <li>• Banner is fetched from <code className="px-1 py-0.5 bg-slate-100 rounded text-xs">/api/banner</code> on every page load.</li>
            <li>• Only when <b>enabled = true</b> and message non-empty, it renders.</li>
            <li>• No deploy needed — save here, refresh site.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
