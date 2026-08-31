import Link from "next/link";

export default function TestsPage(){
  return (
    <div className="bg-[#fcfcfd]">
      <section className="bg-navy-900 text-white">
        <div className="container-soft py-10">
          <h1 className="font-display font-bold text-3xl">Tests & Preparation</h1>
          <p className="text-white/70 mt-2">Daily Quiz • Syllabus Preparation • Grand Test Series. Razorpay secure.</p>
        </div>
      </section>

      <section className="container-soft mt-8">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { t:"Daily Test-Quiz", d:"Subject-wise unlocks from ₹20. 15-25 Qs, timed, with explanation.", c:"Start Now" },
            { t:"Syllabus Preparation", d:"Chapter-wise banks. Learn, practice, revise per topic.", c:"Explore Syllabus" },
            { t:"Grand Test Series", d:"Full-syllabus mocks as per final exam model.", c:"View Series" },
          ].map(x=> (
            <div key={x.t} className="card p-6">
              <div className="font-semibold text-navy-900">{x.t}</div>
              <div className="text-sm text-slate-600 mt-1">{x.d}</div>
              <button className="mt-4 px-4 py-2 rounded-full bg-navy-900 text-white text-sm">{x.c}</button>
            </div>
          ))}
        </div>

        <div className="card mt-6 p-6">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-navy-900">Featured Subjects</div>
            <div className="text-xs text-slate-500">Login required to attempt • Secure checkout</div>
          </div>
          <div className="mt-4 grid md:grid-cols-4 gap-4">
            {[
              { s:"INDIAN HISTORY", p:"₹30", q:"25 Q • 20 min" },
              { s:"Reasoning", p:"₹30", q:"20 Q • 15 min" },
              { s:"Aptitude (Arithmetic)", p:"₹30", q:"20 Q • 20 min" },
              { s:"INDIAN ECONOMY", p:"₹20", q:"15 Q • 15 min" },
            ].map(r=> (
              <div key={r.s} className="rounded-2xl border border-slate-200 p-4 bg-white flex flex-col">
                <div className="w-full h-28 rounded-xl bg-slate-100 border border-slate-200 grid place-items-center text-xs text-slate-500">Subject Cover</div>
                <div className="mt-3 font-semibold text-navy-900 text-sm">{r.s}</div>
                <div className="text-xs text-slate-500">{r.q}</div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-sm font-bold text-navy-900">{r.p}</div>
                  <Link href="/contact" className="px-3 py-1.5 rounded-full bg-navy-900 text-white text-xs">Unlock →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
