"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type BannerData = {
  enabled: boolean;
  message: string;
  type: "info" | "warning" | "success" | "urgent";
  link: string;
  updatedAt?: string;
};

export default function Banner() {
  const [data, setData] = useState<BannerData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const fetchBanner = async () => {
    try {
      const r = await fetch(`/api/banner?t=${Date.now()}`, { cache: "no-store" });
      const d = await r.json();
      setData(d);
      // If banner disabled or message cleared, allow it to hide immediately and clear stale dismissed for next enable
      // Dismissed is per updatedAt - if banner changed, reset dismissed
      const key = d?.updatedAt || d?.message || "";
      const stored = sessionStorage.getItem("ayaan_banner_dismissed");
      const storedKey = sessionStorage.getItem("ayaan_banner_dismissed_key");
      if (d?.enabled && d?.message) {
        if (stored && storedKey !== key) {
          // banner changed, show again
          setDismissed(false);
          sessionStorage.removeItem("ayaan_banner_dismissed");
          sessionStorage.removeItem("ayaan_banner_dismissed_key");
        } else if (stored && storedKey === key) {
          setDismissed(true);
        } else {
          setDismissed(false);
        }
      } else {
        // disabled -> ensure not stuck dismissed for next time, but hide now
        setDismissed(false);
      }
    } catch {}
  };

  useEffect(() => {
    fetchBanner();
    // poll every 10s so disable/enable reflects without hard refresh
    const id = setInterval(fetchBanner, 10000);
    const onVis = () => {
      if (document.visibilityState === "visible") fetchBanner();
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === "ayaan_banner_updated") fetchBanner();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("storage", onStorage);
    // also listen for custom event from admin save in same tab
    const onCustom = () => fetchBanner();
    window.addEventListener("ayaan_banner_updated", onCustom as EventListener);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("ayaan_banner_updated", onCustom as EventListener);
    };
  }, []);

  if (!data?.enabled || dismissed || !data.message) return null;

  const bg =
    data.type === "urgent"
      ? "bg-red-600 text-white"
      : data.type === "warning"
        ? "bg-amber-500 text-white"
        : data.type === "success"
          ? "bg-emerald-600 text-white"
          : "bg-navy-900 text-white";

  return (
    <div className={`relative z-30 ${bg}`}>
      <div className="container-soft">
        <div className="flex items-center gap-3 py-2.5 text-sm">
          <span className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-semibold shrink-0">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> UPDATE
          </span>
          <div className="flex-1 overflow-hidden">
            <div className="whitespace-nowrap overflow-hidden">
              <div className="animate-[marquee_18s_linear_infinite] sm:animate-none inline-block">{data.message}</div>
            </div>
          </div>
          {data.link && (
            <Link href={data.link} className="shrink-0 px-3 py-1.5 rounded-full bg-white text-navy-900 text-xs font-semibold hover:bg-slate-100 hidden sm:inline-flex">
              View →
            </Link>
          )}
          <button
            onClick={() => {
              setDismissed(true);
              const key = data.updatedAt || data.message;
              sessionStorage.setItem("ayaan_banner_dismissed", "1");
              sessionStorage.setItem("ayaan_banner_dismissed_key", key);
            }}
            className="shrink-0 w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 grid place-items-center text-xs"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      </div>
      <style>{`@keyframes marquee { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }`}</style>
    </div>
  );
}
