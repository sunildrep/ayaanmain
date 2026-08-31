"use client";
import { useEffect, useState } from "react";

type Item = { id: string; name: string; price: number; category: string; stock: number; threshold: number; sku?: string };

export default function StorePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState("All");
  const cats = ["All", "Footwear", "Apparel", "Gear", "Equipment", "Fitness"];

  useEffect(() => {
    fetch("/api/store", { cache: "no-store" }).then((r) => r.json()).then((d) => Array.isArray(d) && setItems(d)).catch(() => {});
  }, []);

  const filtered = filter === "All" ? items : items.filter((i) => i.category === filter);

  const stockLabel = (stock: number, threshold: number) => {
    if (stock === 0) return { text: "Out of stock", cls: "bg-red-50 border-red-200 text-red-700" };
    if (stock <= threshold) return { text: `Low stock • ${stock} left`, cls: "bg-amber-50 border-amber-200 text-amber-700" };
    return { text: `In stock • ${stock}`, cls: "bg-emerald-50 border-emerald-200 text-emerald-700" };
  };

  return (
    <div className="bg-[#fcfcfd]">
      <section className="bg-navy-900 text-white">
        <div className="container-soft py-10">
          <h1 className="font-display font-bold text-3xl">Store</h1>
          <p className="text-white/70 mt-2">Kit for preparation — shoes, spikes, apparel, gear. Stock updated live from admin.</p>
        </div>
      </section>
      <section className="container-soft mt-8">
        <div className="flex gap-2 text-sm overflow-auto scrollbar-none pb-1">
          {cats.map((c) => (
            <button key={c} onClick={() => setFilter(c)} className={`shrink-0 px-3 py-1.5 rounded-full border text-sm ${filter === c ? "bg-navy-900 text-white border-navy-900" : "bg-white border-slate-200 hover:bg-slate-50"}`}>
              {c}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-500 self-center hidden sm:inline">{filtered.length} items • {items.filter((i) => i.stock === 0).length} out of stock</span>
        </div>
        {items.length === 0 ? (
          <div className="mt-10 text-center text-sm text-slate-500">Loading store…</div>
        ) : filtered.length === 0 ? (
          <div className="mt-10 text-center text-sm text-slate-500">No items in {filter}</div>
        ) : (
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filtered.map((i) => {
              const s = stockLabel(i.stock, i.threshold);
              const disabled = i.stock === 0;
              return (
                <div key={i.id} className={`card overflow-hidden ${disabled ? "opacity-60" : ""}`}>
                  <div className="h-44 bg-slate-100 border-b border-slate-100 grid place-items-center text-xs text-slate-500 relative">
                    {i.category}
                    <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs border ${s.cls}`}>{s.text}</span>
                  </div>
                  <div className="p-4">
                    <div className="text-sm font-semibold text-navy-900 leading-tight">{i.name}</div>
                    <div className="text-xs text-slate-500">{i.id} {i.sku ? `• ${i.sku}` : ""}</div>
                    <div className="text-sm font-bold text-navy-900 mt-1">₹{i.price.toLocaleString("en-IN")}</div>
                    <button disabled={disabled} className={`mt-3 w-full py-2.5 rounded-full text-sm font-medium transition ${disabled ? "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed" : "bg-navy-900 text-white hover:bg-navy-800"}`}>
                      {disabled ? "Out of Stock" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
