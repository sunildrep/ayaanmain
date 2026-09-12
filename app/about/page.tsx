"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Branch = { id: string; name: string; address: string; phone?: string };

const FALLBACK_BRANCHES: Branch[] = [
  { id: "warangal", name: "Warangal — Residential Academy", address: "Don Bosco School, Opp. Vaagdevi College, Bollikunta, Warangal 506005", phone: "+91 88866 67222" },
  { id: "hanamkonda", name: "Hanamkonda", address: "2nd Floor, Mayuri Mall, Kishanpura, Hanamkonda, Warangal 506001", phone: "+91 88866 67222" },
  { id: "hyderabad", name: "Hyderabad — Dilsukhnagar", address: "Chenna Complex, Near Metro Pillar 1542, Dilsukhnagar, Hyderabad", phone: "+91 88866 67222" },
];

export default function AboutPage() {
  const [branches, setBranches] = useState<Branch[]>(FALLBACK_BRANCHES);
  useEffect(() => {
    fetch("/api/branches", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && d.length > 0 && setBranches(d))
      .catch(() => {});
  }, []);
  return (
    <div className="bg-[#fcfcfd]">
      <section className="bg-navy-900 text-white">
        <div className="container-soft py-10">
          <div className="text-xs tracking-widest text-white/60">ABOUT • ESTD. 2016</div>
          <h1 className="mt-2 font-display font-bold text-3xl lg:text-4xl">Ayaan Foundation & Group of Competitive Institutions</h1>
          <p className="mt-3 text-white/70 max-w-2xl">Built for the aspirant who has desire but needs the right guidance — written + physical, discipline + care.</p>
        </div>
      </section>

      <section className="container-soft mt-8">
        <div className="grid lg:grid-cols-3 gap-4">
          {[
            { n: "01", t: "Mission", d: "Stand by the unemployed youth with high-standard written & physical coaching to make them strong competitors for their dream Govt job." },
            { n: "02", t: "Vision", d: "Evidence-based coaching & learning methods where every aspirant gains confidence and proven preparation strategy." },
            { n: "03", t: "Values", d: "We value desire. We teach, assess, mentor — till the goal is achieved. Discipline, empathy, result." },
          ].map(x=> (
            <div key={x.n} className="card p-6">
              <div className="text-xs font-bold tracking-widest text-sky-700">{x.n}. {x.t}</div>
              <div className="mt-2 text-sm leading-relaxed text-slate-700">{x.d}</div>
            </div>
          ))}
        </div>

        <div className="card mt-6 overflow-hidden">
          <div className="grid lg:grid-cols-12">
            <div className="lg:col-span-5 bg-slate-100 min-h-[360px] grid place-items-center text-slate-500 text-sm">Director Photo</div>
            <div className="lg:col-span-7 p-8">
              <div className="badge bg-slate-50 border-slate-200 text-slate-700">DIRECTOR MESSAGE</div>
              <h2 className="mt-3 font-display font-bold text-xl text-navy-900">Mohd. Anwar Sir — Ex SI (State Topper 2009), International Athlete</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">Before being selected as SI Topper, he was Constable Topper. 25+ years of coaching, physical training for 100+ batches, NSG Commando Overall Champion 2013, Police Medal, Ultra-Marathoner. He teaches physical events personally — because physical is not practice, it’s preparation.</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">“I know what it feels like to wait for that one government job. We built Ayaan so that no aspirant fights alone.”</p>
              <div className="mt-6 flex gap-3">
                <Link href="/academy" className="btn-primary !py-2.5">See Academy</Link>
                <Link href="/contact" className="btn-ghost !py-2.5">Talk to Anwar Sir’s Team</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid lg:grid-cols-2 gap-4">
          <div className="card p-6">
            <div className="font-semibold text-navy-900">Facilities</div>
            <ul className="mt-3 grid gap-2 text-sm text-slate-600">
              <li>• 15-acre residential campus • Boys/Girls hostels</li>
              <li>• 3-Level Grounds • Gym • 24×7 Library & Study Hall</li>
              <li>• Classroom • Mess (hygienic, dietary: eggs, milk, ragi malt) • Canteen</li>
              <li>• Indoor / Outdoor training blocks</li>
            </ul>
          </div>
          <div className="card p-6">
            <div className="font-semibold text-navy-900">Gallery & Awards</div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {Array.from({length:6}).map((_,i)=> <div key={i} className="h-20 rounded-xl bg-slate-100 border border-slate-200 grid place-items-center text-xs text-slate-500">Photo {i+1}</div>)}
            </div>
            <div className="mt-4 text-xs text-slate-500">Police Medals • NSG Championship • National Awards — displayed at campus.</div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-xs tracking-widest font-semibold text-sky-700">OUR BRANCHES</div>
              <h2 className="font-display font-bold text-2xl text-navy-900 mt-1">Visit a branch near you</h2>
              <p className="text-sm text-slate-600 mt-1">Open 9am – 8pm • Call or get directions from the live map.</p>
            </div>
            <span className="hidden sm:inline-flex px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs text-slate-600">{branches.length} branches</span>
          </div>
          <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {branches.map((b) => {
              const q = encodeURIComponent(`${b.name}, ${b.address}`);
              return (
                <div key={b.id} className="card overflow-hidden flex flex-col">
                  <div className="p-5">
                    <div className="font-semibold text-navy-900">{b.name}</div>
                    <div className="text-sm text-slate-600 mt-2 leading-relaxed">{b.address}</div>
                    {b.phone && <a href={`tel:${b.phone.replace(/\s/g, "")}`} className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-navy-900">☎ {b.phone}</a>}
                    <div className="mt-3 flex gap-2">
                      <a href={`https://www.google.com/maps/search/?api=1&query=${q}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-full bg-navy-900 text-white text-xs font-medium hover:bg-navy-800">Get Directions →</a>
                      {b.phone && <a href={`https://api.whatsapp.com/send?phone=918886667222&text=${encodeURIComponent(`Hi, I want details about the ${b.name} branch`)}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-full border border-slate-200 text-xs font-medium hover:bg-slate-50">WhatsApp</a>}
                    </div>
                  </div>
                  <div className="border-t border-slate-100">
                    <iframe
                      title={`Map — ${b.name}`}
                      src={`https://www.google.com/maps?q=${q}&output=embed`}
                      className="w-full h-52 border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
