export default function ContactPage(){
  return (
    <div className="bg-[#fcfcfd]">
      <section className="bg-navy-900 text-white">
        <div className="container-soft py-10">
          <h1 className="font-display font-bold text-3xl">Contact & Admissions</h1>
          <p className="text-white/70 mt-2">We reply within 2 hours • 9am – 8pm • +91 88866 67222</p>
        </div>
      </section>

      <section className="container-soft mt-8">
        <div className="grid lg:grid-cols-3 gap-5">
          {[
            { t:"Warangal — Residential Academy", a:"Don Bosco School, Opp. Vaagdevi College, Bollikunta, Warangal 506005", p:"+91 88866 67222" },
            { t:"Hanamkonda", a:"2nd Floor, Kishanpura, Mayuri Mall, Hanamkonda, Warangal 506001", p:"+91 88866 67222" },
            { t:"Hyderabad — Dilsukhnagar", a:"Chenna Complex, Near Metro Pillar 1542, Dilsukhnagar, Hyderabad", p:"+91 88866 67222" },
          ].map(c=> (
            <div key={c.t} className="card p-6">
              <div className="font-semibold text-navy-900">{c.t}</div>
              <div className="text-sm text-slate-600 mt-2 leading-relaxed">{c.a}</div>
              <div className="text-sm font-medium text-navy-900 mt-3">{c.p}</div>
              <div className="mt-4 h-32 rounded-xl bg-slate-100 border border-slate-200 grid place-items-center text-xs text-slate-500">Google Map Embed</div>
            </div>
          ))}
        </div>

        <div className="card mt-6 p-6 lg:p-8 grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <div className="text-sm tracking-widest font-semibold text-sky-700">GET IN TOUCH</div>
            <h3 className="font-display font-bold text-xl text-navy-900 mt-2">Have a question?</h3>
            <p className="text-sm text-slate-600 mt-2">Course, fees, hostel, batch dates — we’ll guide you. Fill the form or WhatsApp us.</p>
            <div className="mt-6 flex gap-2">
              <a href="https://api.whatsapp.com/send?phone=918886667222" target="_blank" className="px-5 py-2.5 rounded-full bg-[#25D366] text-white text-sm font-semibold">WhatsApp Us</a>
              <a href="tel:+918886667222" className="px-5 py-2.5 rounded-full border border-slate-200 text-sm font-semibold">Call Now</a>
            </div>
          </div>
          <form className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
            <input placeholder="Name" className="px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm" />
            <input placeholder="Phone" className="px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm" />
            <input placeholder="Email" className="sm:col-span-2 px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm" />
            <textarea placeholder="Message — e.g., SI Telugu batch fees?" rows={4} className="sm:col-span-2 px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm" />
            <button type="button" className="sm:col-span-2 px-6 py-3 rounded-full bg-navy-900 text-white text-sm font-semibold">Submit Enquiry →</button>
          </form>
        </div>
      </section>
    </div>
  )
}
