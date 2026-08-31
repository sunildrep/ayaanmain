"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const nav = [
  { label: "Academy", href: "/academy" },
  { label: "Courses", href: "/courses" },
  { label: "Tests", href: "/tests" },
  { label: "Alumni", href: "/alumni" },
  { label: "Store", href: "/store" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);
  const [topDismissed, setTopDismissed] = useState(false);

  useEffect(() => {
    const fetchTop = async () => {
      try {
        const r = await fetch(`/api/banner?t=${Date.now()}`, { cache: "no-store" });
        const d = await r.json();
        if (d?.enabled && d?.message) setBannerMsg(d.message);
        else setBannerMsg(null);
      } catch {}
    };
    fetchTop();
    const id = setInterval(fetchTop, 10000);
    const onVis = () => document.visibilityState === "visible" && fetchTop();
    const onStorage = (e: StorageEvent) => e.key === "ayaan_banner_updated" && fetchTop();
    const onCustom = () => fetchTop();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("storage", onStorage);
    window.addEventListener("ayaan_banner_updated", onCustom as EventListener);
    const dismissed = sessionStorage.getItem("ayaan_top_dismissed");
    if (dismissed) setTopDismissed(true);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("ayaan_banner_updated", onCustom as EventListener);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowSearch((v) => !v);
      }
      if (e.key === "Escape") setShowSearch(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filtered =
    query.trim() === ""
      ? []
      : [
          { title: "SI — Sub Inspector", href: "/courses", desc: "Telugu & English, 3 months + daily tests" },
          { title: "Constable", href: "/courses", desc: "Most demanded, bilingual batches" },
          { title: "Residential Academy", href: "/academy", desc: "15-acre campus, Warangal" },
          { title: "Daily Test — Reasoning", href: "/tests", desc: "₹30 • 20 Q • 15 min" },
          { title: "SSC GD", href: "/courses", desc: "Central forces" },
        ].filter((x) => x.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b transition ${scrolled ? "bg-white/90 backdrop-blur-xl shadow-sm border-slate-200" : "bg-white/80 backdrop-blur-xl border-slate-100"}`}
      >
        {bannerMsg && !topDismissed && (
          <div className="hidden lg:block border-b border-slate-100 bg-slate-50/60">
            <div className="container-soft h-9 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-5">
                <a href="tel:+918886667222" className="flex items-center gap-2 hover:text-navy-800">
                  <span className="w-5 h-5 rounded-full bg-white border border-slate-200 grid place-items-center">☎</span>
                  +91 88866 67222
                </a>
                <span className="hidden xl:inline-flex items-center gap-2 max-w-[420px] truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" /> {bannerMsg}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSearch(true)}
                  className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-600"
                >
                  <span>Search</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 border text-[10px] leading-none">⌘K</span>
                </button>
                <span className="hidden md:inline text-slate-400">Warangal • Hanamkonda • Hyderabad</span>
                <Link href="/contact" className="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50">
                  Contact
                </Link>
                <button
                  onClick={() => {
                    setTopDismissed(true);
                    sessionStorage.setItem("ayaan_top_dismissed", "1");
                  }}
                  className="w-6 h-6 rounded-full bg-white border border-slate-200 grid place-items-center hover:bg-slate-100 ml-1"
                  aria-label="Dismiss top bar"
                  title="Dismiss"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="container-soft">
          <div className="h-[72px] flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-navy-800 text-white grid place-items-center font-display font-bold text-[15px]">A</div>
              <div className="leading-tight hidden sm:block">
                <div className="font-display font-bold text-[16px] tracking-tight text-navy-800">AYAAN INSTITUTE</div>
                <div className="text-[11px] tracking-[0.14em] text-slate-500 font-medium">GROUP OF COMPETITIVE INSTITUTIONS</div>
              </div>
              <div className="sm:hidden font-display font-bold text-navy-800">AYAAN</div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {nav.map((n) => (
                <Link
                  key={n.label}
                  href={n.href}
                  className="px-4 py-2 rounded-full text-sm font-medium text-slate-600 hover:text-navy-800 hover:bg-slate-50 transition"
                >
                  {n.label}
                </Link>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-2">
              <Link href="/admission" className="inline-flex px-4 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800 text-xs font-bold hover:bg-amber-100 shadow-sm whitespace-nowrap">
                Get Admission
              </Link>
              <Link href="/login" className="text-sm font-medium text-slate-700 hover:text-navy-800 px-2">
                Login
              </Link>
              <button
                onClick={() => setShowSearch(true)}
                className="w-9 h-9 rounded-full border border-slate-200 grid place-items-center hover:bg-slate-50"
                aria-label="Search"
              >
                ⌕
              </button>
              <Link href="/contact" className="btn-primary !py-2.5 !px-5 shadow-sm hover:shadow-md active:scale-[0.98] transition">
                Enquire Now →
              </Link>
            </div>

            <div className="flex lg:hidden items-center gap-2">
              <button onClick={() => setShowSearch(true)} className="w-9 h-9 rounded-full border border-slate-200 grid place-items-center">
                ⌕
              </button>
              <button
                onClick={() => setOpen(!open)}
                className="w-10 h-10 rounded-full border border-slate-200 grid place-items-center bg-white"
                aria-label="Menu"
              >
                <span className="text-lg">{open ? "✕" : "☰"}</span>
              </button>
            </div>
          </div>

          {open && (
            <div className="lg:hidden pb-6 border-t border-slate-100 pt-4 grid gap-1">
              {nav.map((n) => (
                <Link
                  key={n.label}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 rounded-xl hover:bg-slate-50 font-medium flex items-center justify-between"
                >
                  {n.label} <span className="text-slate-400">→</span>
                </Link>
              ))}
              <Link href="/admission" onClick={() => setOpen(false)} className="btn-primary mt-3 justify-center">
                Get Admission →
              </Link>
              <Link href="/login" onClick={() => setOpen(false)} className="mt-2 w-full py-3 rounded-xl border border-slate-200 bg-white grid place-items-center text-sm font-medium hover:bg-slate-50">
                Login to Account
              </Link>
              <Link href="/contact" onClick={() => setOpen(false)} className="mt-2 w-full py-3 rounded-xl bg-slate-50 border border-slate-200 grid place-items-center text-sm">
                Enquire Now
              </Link>
              <div className="mt-3 flex gap-2 text-xs">
                <a href="tel:+918886667222" className="flex-1 py-3 rounded-xl border border-slate-200 grid place-items-center font-medium">
                  Call
                </a>
                <a
                  href="https://api.whatsapp.com/send?phone=918886667222"
                  target="_blank"
                  className="flex-1 py-3 rounded-xl bg-[#25D366] text-white grid place-items-center font-medium"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>
      </header>

      {showSearch && (
        <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm p-4 grid place-items-start pt-[12vh]" onClick={() => setShowSearch(false)}>
          <div
            className="w-full max-w-xl mx-auto card overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
              <span className="text-slate-400">⌕</span>
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search courses, tests, campus… (e.g., SI, Constable, Residential)"
                className="flex-1 outline-none text-sm placeholder:text-slate-400"
              />
              <button onClick={() => setShowSearch(false)} className="text-xs px-2 py-1 rounded bg-slate-100 border">
                ESC
              </button>
            </div>
            <div className="max-h-[50vh] overflow-auto p-2">
              {query.trim() === "" ? (
                <div className="p-6 text-center">
                  <div className="text-sm font-medium text-navy-900">Quick links</div>
                  <div className="mt-3 flex flex-wrap gap-2 justify-center">
                    {["Residential Academy", "SI Telugu", "Daily Test", "Hostel Fees"].map((x) => (
                      <span key={x} className="px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-xs">
                        {x}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 text-xs text-slate-500">Press ⌘K anytime to search</div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">No results for “{query}”. Try SI / Constable / Academy.</div>
              ) : (
                <div className="grid gap-1 p-1">
                  {filtered.map((r) => (
                    <Link
                      key={r.title}
                      href={r.href}
                      onClick={() => setShowSearch(false)}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200"
                    >
                      <div>
                        <div className="text-sm font-medium text-navy-900">{r.title}</div>
                        <div className="text-xs text-slate-500">{r.desc}</div>
                      </div>
                      <span className="text-slate-400">→</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
