import Link from "next/link";

const courses = [
  { slug: "si", title: "Sub-Inspector (SI)", desc: "Telugu & English medium, 3 months syllabus + continuous test cycle.", tag: "Most Applied" },
  { slug: "constable", title: "Constable", desc: "Favourite in TS & AP. Daily tests, weekly grands, physical at L1-L3.", tag: "Bilingual" },
  { slug: "groups", title: "Group 1 • 2 • 3 • 4", desc: "Updated content with current affairs + model paper discussions.", tag: "Groups" },
  { slug: "ssc-gd", title: "SSC GD", desc: "Central armed forces — written + physical preparation.", tag: "SSC" },
  { slug: "army", title: "Army / Navy / Airforce", desc: "Defence entry — written, medical, physical guidance.", tag: "Defence" },
  { slug: "upsc", title: "UPSC Civil Services", desc: "Prelims + Mains + Interview. GS, CSAT, Optional, Essay, Answer writing.", tag: "Premium" },
  { slug: "online", title: "Online Coaching", desc: "Live + recorded. Unlimited rewatch, offline download.", tag: "Online" },
];

export default function CoursesPage(){
  return (
    <div className="bg-[#fcfcfd]">
      <section className="bg-navy-900 text-white">
        <div className="container-soft py-10">
          <h1 className="font-display font-bold text-3xl">Courses</h1>
          <p className="text-white/70 mt-2 max-w-2xl">SI, Constable, Groups, SSC GD, Defence, UPSC. Offline • Residential • Online. Telugu & English.</p>
        </div>
      </section>
      <section className="container-soft mt-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map(c=> (
            <div key={c.slug} className="card p-6 flex flex-col">
              <div className="text-xs tracking-widest font-semibold text-sky-700">{c.tag}</div>
              <div className="mt-1 font-display font-bold text-navy-900">{c.title}</div>
              <div className="mt-2 text-sm text-slate-600 flex-1">{c.desc}</div>
              <div className="mt-4 flex gap-2">
                <Link href={`/courses`} className="px-4 py-2 rounded-full bg-navy-900 text-white text-sm">View Details</Link>
                <Link href="/contact" className="px-4 py-2 rounded-full border border-slate-200 text-sm">Enquire</Link>
              </div>
            </div>
          ))}
        </div>

        <div className="card mt-6 p-6 grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <div className="font-semibold text-navy-900">How offline works</div>
            <p className="text-sm text-slate-600 mt-2">3 months syllabus coverage. Daily study hours, daily tests, weekly/monthly grand tests. Students categorized by performance; extra care for minimum scorers. Post-completion: daily model practice tests + discussion. Question papers can be solved at home.</p>
          </div>
          <div className="lg:col-span-4 rounded-xl bg-slate-50 border border-slate-200 p-4">
            <div className="text-sm font-semibold text-navy-900">Need help choosing?</div>
            <div className="text-sm text-slate-600 mt-1">Tell us your qualification & target year — we'll recommend SI vs Constable vs Groups vs UPSC.</div>
            <Link href="/contact" className="mt-3 inline-flex btn-primary !py-2.5">Get Recommendation →</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
