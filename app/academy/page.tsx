import Link from "next/link";

export default function AcademyPage(){
  return (
    <div className="bg-[#fcfcfd]">
      <section className="bg-navy-900 text-white">
        <div className="container-soft py-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs">RESIDENTIAL • INDIA'S FIRST</div>
          <h1 className="mt-3 font-display font-bold text-3xl lg:text-4xl">Ayaan Police Academy</h1>
          <p className="mt-2 text-white/70 max-w-2xl">Own campus — classroom, grounds, hostel within 100m. Written by senior faculty. Physical by Director himself.</p>
          <div className="mt-6 flex gap-3">
            <Link href="/contact" className="px-6 py-3 rounded-full bg-white text-navy-900 text-sm font-semibold">Apply for Residential Batch</Link>
            <Link href="/courses" className="px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white text-sm font-semibold">View Day-Scholar Option</Link>
          </div>
        </div>
      </section>

      <section className="container-soft mt-8">
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <div className="card p-8">
              <h2 className="font-display font-bold text-xl text-navy-900">Our Coaching Method</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">Faculty panel from across both Telugu states. Content updated to current competitive standards. Daily teaching + daily testing loop.</p>
              <h3 className="mt-6 font-semibold text-navy-900">Preparation Strategy (designed by Anwar Sir)</h3>
              <div className="mt-3 grid sm:grid-cols-2 gap-3">
                {[
                  "Daily 4am – 6am Study Hours",
                  "Daily Evening Practice Test + Explanation",
                  "Night Study + Doubts Clarification",
                  "Weekly Grand Test + Explanation",
                  "Monthly Model Test + Explanation",
                  "Monthly Physical Assessment"
                ].map(x=> <div key={x} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{x}</div>)}
              </div>

              <h3 className="mt-8 font-semibold text-navy-900">Physical — 3 Level Grounds</h3>
              <div className="mt-3 grid sm:grid-cols-3 gap-3">
                {[
                  {l:"Level 1", t:"Track Events", d:"100m / 200m / 400m daily practice"},
                  {l:"Level 2", t:"Strength", d:"Gym + functional training"},
                  {l:"Level 3", t:"Events", d:"High Jump, Long Jump, Shot-put, Sand & Mud tracks"},
                ].map(x=> (
                  <div key={x.l} className="card p-4">
                    <div className="text-xs tracking-widest font-bold text-sky-700">{x.l}</div>
                    <div className="font-semibold text-navy-900">{x.t}</div>
                    <div className="text-sm text-slate-600 mt-1">{x.d}</div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-slate-600">Ayaan is the only academy where the chief coach is the Director — International Sportsperson, awarded for physical excellence.</p>
            </div>
          </div>
          <div className="lg:col-span-4">
            <div className="card p-6">
              <div className="font-semibold text-navy-900">Facilities</div>
              <ul className="mt-3 grid gap-2 text-sm text-slate-600">
                <li>• 15 acres • Own campus</li><li>• Boys & Girls Residential</li><li>• Special Grounds (Track, Sand, Mud)</li><li>• Library 24Hrs • Gym • Study Hall 24Hrs</li><li>• Dietary Hostel • Canteen</li>
              </ul>
              <div className="mt-6 p-4 rounded-xl bg-navy-900 text-white">
                <div className="text-sm font-semibold">Need hostel info?</div>
                <div className="text-sm text-white/70 mt-1">Food, discipline, timings, fees — talk to admissions.</div>
                <Link href="/contact" className="mt-3 inline-flex px-4 py-2 rounded-full bg-white text-navy-900 text-sm font-semibold">Contact Admissions →</Link>
              </div>
            </div>
            <div className="card p-6 mt-4">
              <div className="font-semibold text-navy-900">Courses at Academy</div>
              <div className="mt-3 grid gap-2">
                {["SI Coaching →","Constable Coaching →","Army Coaching →"].map(x=> <Link key={x} href="/courses" className="px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm font-medium">{x}</Link>)}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
