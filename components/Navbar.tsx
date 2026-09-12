"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { AYAAN_APP_URL } from "@/lib/appConfig";

type NavItem = { label: string; href: string; external?: boolean };
const nav: NavItem[] = [
  { label: "About Us", href: "/about" },
  { label: "Aspirant Corner", href: "/courses" },
  { label: "Tests", href: AYAAN_APP_URL, external: true },
  { label: "Alumni", href: "/alumni" },
  { label: "Store", href: "/store" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition ${scrolled ? "bg-white/90 backdrop-blur-xl shadow-sm" : "bg-white/80 backdrop-blur-xl"}`}
      >

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
                n.external ? (
                  <a
                    key={n.label}
                    href={n.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-full text-sm font-medium text-slate-600 hover:text-navy-800 hover:bg-slate-50 transition"
                  >
                    {n.label} ↗
                  </a>
                ) : (
                  <Link
                    key={n.label}
                    href={n.href}
                    className="px-4 py-2 rounded-full text-sm font-medium text-slate-600 hover:text-navy-800 hover:bg-slate-50 transition"
                  >
                    {n.label}
                  </Link>
                )
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-2">
              <Link href="/admission" className="inline-flex px-4 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800 text-xs font-bold hover:bg-amber-100 shadow-sm whitespace-nowrap">
                Get Registered
              </Link>
              <Link href="/login" className="text-sm font-medium text-slate-700 hover:text-navy-800 px-2">
                Login
              </Link>
            </div>

            <div className="flex lg:hidden items-center gap-2">
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
                n.external ? (
                  <a
                    key={n.label}
                    href={n.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className="px-4 py-3 rounded-xl hover:bg-slate-50 font-medium flex items-center justify-between"
                  >
                    {n.label} ↗
                  </a>
                ) : (
                  <Link
                    key={n.label}
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className="px-4 py-3 rounded-xl hover:bg-slate-50 font-medium flex items-center justify-between"
                  >
                    {n.label} <span className="text-slate-400">→</span>
                  </Link>
                )
              ))}
              <Link href="/admission" onClick={() => setOpen(false)} className="btn-primary mt-3 justify-center">
                Get Registered →
              </Link>
              <Link href="/login" onClick={() => setOpen(false)} className="mt-2 w-full py-3 rounded-xl border border-slate-200 bg-white grid place-items-center text-sm font-medium hover:bg-slate-50">
                Login to Account
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
    </>
  );
}
