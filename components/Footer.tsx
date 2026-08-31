import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 bg-navy-900 text-slate-300">
      <div className="container-soft py-12">
        <div className="grid lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] gap-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white text-navy-900 grid place-items-center font-display font-bold">A</div>
              <div>
                <div className="font-display font-bold text-white leading-none">AYAAN INSTITUTE</div>
                <div className="text-xs tracking-widest text-slate-400">ESTD. 2016 • TELANGANA</div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-400 max-w-sm">
              India&apos;s first residential campus for uniform jobs. Written + Physical training by senior faculty &amp; Mohd. Anwar Sir (Ex-SI, State Topper, International Athlete).
            </p>
            <div className="mt-6 flex gap-2">
              <a className="w-9 h-9 rounded-full bg-white/10 grid place-items-center hover:bg-white/20" href="#">f</a>
              <a className="w-9 h-9 rounded-full bg-white/10 grid place-items-center hover:bg-white/20" href="#">◎</a>
              <a className="w-9 h-9 rounded-full bg-white/10 grid place-items-center hover:bg-white/20" href="#">in</a>
              <a className="w-9 h-9 rounded-full bg-white/10 grid place-items-center hover:bg-white/20" href="#">▶</a>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-white">Academy</div>
            <ul className="mt-4 grid gap-2.5 text-sm text-slate-400">
              <li><Link href="/academy" className="hover:text-white">Residential Campus</Link></li>
              <li><Link href="/courses" className="hover:text-white">SI / Constable</Link></li>
              <li><Link href="/courses" className="hover:text-white">Groups & SSC GD</Link></li>
              <li><Link href="/courses" className="hover:text-white">Army / Defence</Link></li>
              <li><Link href="/tests" className="hover:text-white">Test Series</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Explore</div>
            <ul className="mt-4 grid gap-2.5 text-sm text-slate-400">
              <li><Link href="/about" className="hover:text-white">About Us</Link></li>
              <li><Link href="/about" className="hover:text-white">Director Message</Link></li>
              <li><Link href="#" className="hover:text-white">Faculty</Link></li>
              <li><Link href="#" className="hover:text-white">Gallery</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
            <div className="text-sm font-semibold text-white">Visit a campus</div>
            <div className="mt-3 grid gap-3 text-sm text-slate-300">
              <div>
                <div className="font-medium text-white">Warangal – Residential</div>
                <div className="text-slate-400 leading-relaxed">Don Bosco School, Opp. Vaagdevi College, Bollikunta, Warangal 506005</div>
              </div>
              <div>
                <div className="font-medium text-white">Hyderabad</div>
                <div className="text-slate-400">Chenna Complex, Pillar 1542, Dilsukhnagar</div>
              </div>
              <a href="tel:+918886667222" className="mt-1 inline-flex items-center gap-2 text-white font-medium">+91 88866 67222 →</a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row gap-3 items-center justify-between text-xs text-slate-400">
          <span>© 2026 Ayaan Police Academy. All rights reserved.</span>
          <span className="flex gap-4"><a className="hover:text-white" href="#">Privacy</a><a className="hover:text-white" href="#">Terms</a><span>Designed for International Standards</span></span>
        </div>
      </div>
    </footer>
  );
}
