"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Alumni = { id: string; name: string; role: string; batch: string; course: string; quote: string; video: string; image: string; featured: boolean; createdAt: string };

function toEmbed(url: string) {
  if (!url) return "";
  try {
    const u = new URL(url);
    const v = u.searchParams.get("v");
    if (v) return `https://www.youtube.com/embed/${v}`;
    if (u.hostname.includes("youtu.be")) return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    return url;
  } catch { return url; }
}

export default function AlumniPage() {
  const [list, setList] = useState<Alumni[]>([]);
  const [course, setCourse] = useState("All");
  const [q, setQ] = useState("");
  const [playing, setPlaying] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/alumni", { cache: "no-store" }).then((r) => r.json()).then((d) => Array.isArray(d) && setList(d)).catch(() => {});
  }, []);

  const courses = useMemo(() => ["All", ...Array.from(new Set(list.map((x) => x.course)))], [list]);
  const filtered = useMemo(() => {
    return list.filter((x) => {
      const okCourse = course === "All" || x.course === course;
      const okQ = !q || `${x.name} ${x.role} ${x.quote} ${x.batch}`.toLowerCase().includes(q.toLowerCase());
      return okCourse && okQ;
    });
  }, [list, course, q]);

  return (
    <div className="bg-[#fcfcfd]">
      <section className="bg-navy-900 text-white">
        <div className="container-soft py-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs">ALUMNI • REAL STORIES</div>
          <h1 className="mt-3 font-display font-bold text-3xl lg:text-4xl">Our Alumni — Proud Uniform Holders</h1>
          <p className="mt-2 text-white/70 max-w-2xl text-sm leading-relaxed">From auto driver to constable, day-1 physical to top marks — hear how they did it at Ayaan. Sourced from ayaaninstitute.in with videos.</p>
          <p className="mt-2 text-xs text-white/50">Source: https://ayaaninstitute.in/ → Testimonials • {list.length} stories</p>
        </div>
      </section>

      <section className="container-soft mt-6">
        <div className="card p-4 flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
          <div className="flex gap-2 overflow-auto scrollbar-none">
            {courses.map((c) => (
              <button key={c} onClick={() => setCourse(c)} className={`shrink-0 px-4 py-2 rounded-full border text-sm font-medium transition ${course === c ? "bg-navy-900 text-white border-navy-900" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{c}</button>
            ))}
          </div>
          <div className="flex gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-[260px]">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, role, quote…" className="w-full pl-9 pr-3 py-2.5 rounded-full border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
              <span className="absolute left-3 top-2.5 text-slate-400">⌕</span>
            </div>
            <span className="hidden sm:inline-flex items-center px-3 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-600">{filtered.length} stories</span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="card mt-6 p-12 text-center">
            <div className="text-sm font-semibold text-navy-900">No alumni for “{course}” {q ? `+ “${q}”` : ""}</div>
            <div className="text-sm text-slate-500 mt-1">Try All or clear search. Add new via Admin → Alumni.</div>
          </div>
        ) : (
          <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((a) => (
              <div key={a.id} className="card p-6 flex flex-col">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0 grid place-items-center text-xs font-bold text-slate-600">
                    {a.image ? <img src={a.image} alt={a.name} className="w-full h-full object-cover" /> : a.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-navy-900">{a.name}</div>
                    <div className="text-xs text-slate-500">{a.role}</div>
                    <div className="text-xs text-slate-400">{a.batch} • {a.course}</div>
                  </div>
                  {a.featured && <span className="text-xs px-2 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700">Featured</span>}
                </div>
                <div className="mt-3 text-sm leading-relaxed text-slate-700 flex-1">“{a.quote}”</div>
                {a.video ? (
                  <div className="mt-auto pt-4">
                    {playing === a.id ? (
                      <div className="rounded-xl overflow-hidden border border-slate-200 bg-black aspect-video">
                        <iframe src={toEmbed(a.video)} title={a.name} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen />
                      </div>
                    ) : (
                      <button onClick={() => setPlaying(a.id)} className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-sm transition text-left">
                        <span className="w-10 h-10 rounded-full bg-red-600 text-white grid place-items-center shrink-0">▶</span>
                        <div className="flex-1 min-w-0"><div className="text-sm font-medium text-navy-900">Watch story</div><div className="text-xs text-slate-500 truncate">{a.video}</div></div>
                        <span className="shrink-0 text-xs text-slate-400">Play</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="mt-auto pt-4 text-xs text-slate-400">No video — text testimonial</div>
                )}
                <div className="mt-3 text-xs text-slate-400">{new Date(a.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short" })} • {a.id}</div>
              </div>
            ))}
          </div>
        )}

        <div className="card mt-8 p-6 text-center">
          <div className="font-semibold text-navy-900">Your story next?</div>
          <div className="text-sm text-slate-600 mt-1">Join a batch, get your uniform, share your journey.</div>
          <div className="mt-4 flex gap-2 justify-center">
            <Link href="/admission" className="btn-primary">Get Registered →</Link>
            <Link href="/contact" className="btn-ghost">Visit Campus</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
