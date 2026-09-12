"use client";
import { useEffect } from "react";
import { AYAAN_APP_URL } from "@/lib/appConfig";

export default function TestsPage() {
  useEffect(() => {
    const t = setTimeout(() => {
      window.location.href = AYAAN_APP_URL;
    }, 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="bg-[#fcfcfd] min-h-[70vh] grid place-items-center p-4">
      <div className="card p-8 w-full max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-navy-900 text-white grid place-items-center mx-auto text-xl">◍</div>
        <h1 className="mt-4 font-display font-bold text-xl text-navy-900">Tests have moved to the Ayaan App</h1>
        <p className="text-sm text-slate-600 mt-2">Daily Quiz • Syllabus Preparation • Grand Test Series — now inside the Ayaan Institutions app. Redirecting you…</p>
        <div className="mt-4 h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full bg-navy-900 rounded-full animate-pulse w-2/3" />
        </div>
        <div className="mt-6 flex gap-2 justify-center">
          <a href={AYAAN_APP_URL} target="_blank" rel="noopener noreferrer" className="btn-primary">Open Ayaan App →</a>
          <a href="/" className="btn-ghost">Home</a>
        </div>
        <div className="mt-3 text-xs text-slate-400">If you are not redirected, tap “Open Ayaan App”.</div>
      </div>
    </div>
  );
}
