"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import RazorpayCheckout from "@/components/payment/RazorpayCheckout";

type Item = { id: string; name: string; price: number; category: string; stock: number; threshold: number; sku?: string; image?: string; sizes?: string[] };
type CartLine = { id: string; storeItemId: string; qty: number; size: string; product: Item };
type Me = { name: string; email: string; phone: string } | null;

const PENDING_KEY = "ayaan_pending_cart";

export default function StorePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState("All");
  const [me, setMe] = useState<Me>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [selSize, setSelSize] = useState<Record<string, string>>({});
  const [selQty, setSelQty] = useState<Record<string, number>>({});
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  // checkout
  const [checkout, setCheckout] = useState<{ orderId: string; orderNo: string; razorpayOrderId: string; amount: number } | null>(null);
  const [confirmed, setConfirmed] = useState<{ orderNo: string; amount: number } | null>(null);

  const cats = ["All", "Footwear", "Apparel", "Gear", "Equipment", "Fitness"];

  const loadCart = useCallback(async () => {
    const r = await fetch("/api/store/cart", { cache: "no-store" });
    if (r.ok) setCart(await r.json());
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const r = await fetch("/api/auth/me", { cache: "no-store" });
      const d = await r.json();
      if (d.authenticated && d.user) {
        setMe({ name: d.user.name, email: d.user.email, phone: d.user.phone });
        return true;
      }
    } catch {}
    setMe(null);
    return false;
  }, []);

  useEffect(() => {
    fetch("/api/store", { cache: "no-store" }).then((r) => r.json()).then((d) => Array.isArray(d) && setItems(d)).catch(() => {});
    (async () => {
      const ok = await checkAuth();
      setAuthChecked(true);
      if (ok) {
        await loadCart();
        // Flush selection preserved across login (product + qty + size)
        try {
          const raw = localStorage.getItem(PENDING_KEY);
          if (raw) {
            const p = JSON.parse(raw);
            if (p?.storeItemId) {
              const r = await fetch("/api/store/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) });
              if (r.ok) {
                await loadCart();
                setMsg({ type: "success", text: "Your saved selection was added to cart after login ✓" });
              }
            }
            localStorage.removeItem(PENDING_KEY);
          }
        } catch {}
      }
    })();
  }, [checkAuth, loadCart]);

  const filtered = filter === "All" ? items : items.filter((i) => i.category === filter);

  const stockLabel = (stock: number, threshold: number) => {
    if (stock === 0) return { text: "Out of stock", cls: "bg-red-50 border-red-200 text-red-700" };
    if (stock <= threshold) return { text: `Low stock • ${stock} left`, cls: "bg-amber-50 border-amber-200 text-amber-700" };
    return { text: `In stock • ${stock}`, cls: "bg-emerald-50 border-emerald-200 text-emerald-700" };
  };

  const addToCart = async (item: Item) => {
    setMsg(null);
    const sizes = item.sizes || [];
    const size = selSize[item.id] || "";
    if (sizes.length > 0 && !size) return setMsg({ type: "error", text: `Please select a size for ${item.name} (S/M/L/XL…)` });
    const qty = Math.max(1, selQty[item.id] || 1);

    // Login required — preserve selection and ask to log in
    const authed = me || (await checkAuth());
    if (!authed) {
      try {
        localStorage.setItem(PENDING_KEY, JSON.stringify({ storeItemId: item.id, qty, size }));
      } catch {}
      setLoginPrompt(true);
      return;
    }

    setBusy(true);
    const r = await fetch("/api/store/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeItemId: item.id, qty, size }),
    });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) {
      if (r.status === 401) { setLoginPrompt(true); return; }
      return setMsg({ type: "error", text: d.error || "Could not add to cart" });
    }
    setCart(d.cart || []);
    setMsg({ type: "success", text: `${item.name}${size ? ` (${size})` : ""} added to cart ✓` });
  };

  const updateQty = async (line: CartLine, qty: number) => {
    if (qty < 1) return removeLine(line.id);
    const r = await fetch("/api/store/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ storeItemId: line.storeItemId, qty, size: line.size }) });
    const d = await r.json().catch(() => ({}));
    if (r.ok) setCart(d.cart || []);
    else setMsg({ type: "error", text: d.error || "Could not update quantity" });
  };

  const removeLine = async (id: string) => {
    await fetch(`/api/store/cart?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    await loadCart();
  };

  const subtotal = cart.reduce((s, c) => s + (c.product?.price || 0) * c.qty, 0);
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  const startCheckout = async () => {
    setMsg(null);
    if (cart.length === 0) return;
    setBusy(true);
    const r = await fetch("/api/store/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) return setMsg({ type: "error", text: d.error || "Checkout failed" });
    setCartOpen(false);
    setCheckout({ orderId: d.orderId, orderNo: d.orderNo, razorpayOrderId: d.razorpayOrderId, amount: d.amount / 100 });
  };

  const onPaySuccess = async (paymentId: string, rzpOrderId: string, signature: string) => {
    if (!checkout) return;
    const r = await fetch("/api/store/orders/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: checkout.orderId, razorpay_payment_id: paymentId, razorpay_signature: signature }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return setMsg({ type: "error", text: d.error || "Payment verification failed" });
    setCheckout(null);
    setConfirmed({ orderNo: checkout.orderNo, amount: checkout.amount });
    setCart([]);
  };

  return (
    <div className="bg-[#fcfcfd] pb-10">
      <section className="bg-navy-900 text-white">
        <div className="container-soft py-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-3xl">Store</h1>
            <p className="text-white/70 mt-2">Kit for preparation — shoes, spikes, apparel, gear. Stock updated live from admin.</p>
          </div>
          <button onClick={() => setCartOpen(true)} className="px-5 py-2.5 rounded-full bg-white text-navy-900 text-sm font-semibold hover:bg-slate-100 shrink-0">
            🛒 Cart {cartCount > 0 ? `(${cartCount})` : ""}
          </button>
        </div>
      </section>

      <section className="container-soft mt-8">
        {msg && <div className={`mb-4 text-sm px-4 py-3 rounded-xl border ${msg.type === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>{msg.text}</div>}
        {!authChecked ? null : !me ? (
          <div className="mb-4 text-xs text-slate-600 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">🔒 Login required to add items to cart & checkout. Your size/quantity selection is saved across login.</div>
        ) : null}
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
              const sizes = i.sizes || [];
              return (
                <div key={i.id} className={`card overflow-hidden flex flex-col ${disabled ? "opacity-60" : ""}`}>
                  <div className="h-44 bg-slate-100 border-b border-slate-100 grid place-items-center text-xs text-slate-500 relative overflow-hidden">
                    {i.image ? <img src={i.image} alt={i.name} className="w-full h-full object-cover" /> : i.category}
                    <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs border ${s.cls}`}>{s.text}</span>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <div className="text-sm font-semibold text-navy-900 leading-tight">{i.name}</div>
                    <div className="text-xs text-slate-500">{i.id} {i.sku ? `• ${i.sku}` : ""}</div>
                    <div className="text-sm font-bold text-navy-900 mt-1">₹{i.price.toLocaleString("en-IN")}</div>
                    {sizes.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs font-medium text-slate-700">Size *</div>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {sizes.map((sz) => (
                            <button
                              key={sz}
                              onClick={() => setSelSize({ ...selSize, [i.id]: sz })}
                              className={`px-3 py-1.5 rounded-full border text-xs font-medium ${selSize[i.id] === sz ? "bg-navy-900 text-white border-navy-900" : "bg-white border-slate-200 hover:bg-slate-50"}`}
                            >{sz}</button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-slate-500">Qty</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setSelQty({ ...selQty, [i.id]: Math.max(1, (selQty[i.id] || 1) - 1) })} className="w-7 h-7 rounded-full border border-slate-200 grid place-items-center text-sm">−</button>
                        <span className="w-8 text-center text-sm font-medium">{selQty[i.id] || 1}</span>
                        <button onClick={() => setSelQty({ ...selQty, [i.id]: Math.min(i.stock || 99, (selQty[i.id] || 1) + 1) })} className="w-7 h-7 rounded-full border border-slate-200 grid place-items-center text-sm">+</button>
                      </div>
                    </div>
                    <button disabled={disabled || busy} onClick={() => addToCart(i)} className={`mt-3 w-full py-2.5 rounded-full text-sm font-medium transition ${disabled ? "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed" : "bg-navy-900 text-white hover:bg-navy-800"}`}>
                      {disabled ? "Out of Stock" : me ? "Add to Cart" : "Login to Add to Cart"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Login required modal */}
      {loginPrompt && (
        <div className="fixed inset-0 z-[70] bg-slate-900/40 backdrop-blur-sm p-4 grid place-items-center" onClick={() => setLoginPrompt(false)}>
          <div className="card w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display font-bold text-lg text-navy-900">Login required</h3>
            <p className="text-sm text-slate-600 mt-1">Please log in to add items to your cart and checkout. Your selected product, quantity and size are saved.</p>
            <div className="mt-4 grid gap-2">
              <Link href="/login" className="btn-primary justify-center">Login / Register →</Link>
              <button onClick={() => setLoginPrompt(false)} className="py-2.5 rounded-full border border-slate-200 text-sm hover:bg-slate-50">Continue browsing</button>
            </div>
          </div>
        </div>
      )}

      {/* Cart drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-[70] bg-slate-900/40 backdrop-blur-sm" onClick={() => setCartOpen(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-navy-900">Your Cart {cartCount > 0 ? `(${cartCount})` : ""}</h3>
              <button onClick={() => setCartOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 grid place-items-center">✕</button>
            </div>
            <div className="flex-1 overflow-auto p-5 grid gap-3 content-start">
              {cart.length === 0 ? (
                <div className="text-sm text-slate-500 text-center py-10">Cart is empty — add some kit!</div>
              ) : cart.map((c) => (
                <div key={c.id} className="p-3 rounded-xl border border-slate-200 flex gap-3">
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-navy-900">{c.product?.name}</div>
                    <div className="text-xs text-slate-500">{c.size ? `Size: ${c.size} • ` : ""}₹{(c.product?.price || 0).toLocaleString("en-IN")} each</div>
                    <div className="mt-2 flex items-center gap-1">
                      <button onClick={() => updateQty(c, c.qty - 1)} className="w-7 h-7 rounded-full border grid place-items-center text-sm">−</button>
                      <span className="w-8 text-center text-sm font-medium">{c.qty}</span>
                      <button onClick={() => updateQty(c, c.qty + 1)} className="w-7 h-7 rounded-full border grid place-items-center text-sm">+</button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-navy-900">₹{((c.product?.price || 0) * c.qty).toLocaleString("en-IN")}</div>
                    <button onClick={() => removeLine(c.id)} className="mt-2 text-xs text-red-600 hover:underline">Remove</button>
                  </div>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="p-5 border-t border-slate-100">
                <div className="flex justify-between text-sm"><span className="text-slate-600">Subtotal</span><span className="font-bold text-navy-900">₹{subtotal.toLocaleString("en-IN")}</span></div>
                <button onClick={startCheckout} disabled={busy} className="mt-3 w-full btn-primary justify-center disabled:opacity-50">{busy ? "Creating order…" : "Checkout → Pay via Razorpay"}</button>
                <div className="mt-2 text-xs text-slate-400 text-center">Secure Razorpay • UPI, Cards, Net Banking</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Razorpay checkout */}
      {checkout && me && (
        <RazorpayCheckout
          orderId={checkout.razorpayOrderId}
          amount={checkout.amount}
          userName={me.name}
          userEmail={me.email}
          userPhone={me.phone}
          course={`Store Order ${checkout.orderNo}`}
          description={`Store Order ${checkout.orderNo} - Payment`}
          onSuccess={onPaySuccess}
          onError={(e) => { setMsg({ type: "error", text: e }); setCheckout(null); }}
          onClose={() => setCheckout(null)}
        />
      )}

      {/* Order confirmation */}
      {confirmed && (
        <div className="fixed inset-0 z-[70] bg-slate-900/40 backdrop-blur-sm p-4 grid place-items-center" onClick={() => setConfirmed(null)}>
          <div className="card w-full max-w-md p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 grid place-items-center mx-auto text-xl">✓</div>
            <h3 className="mt-3 font-display font-bold text-lg text-navy-900">Order Confirmed!</h3>
            <p className="text-sm text-slate-600 mt-1">Order <b className="text-navy-900">{confirmed.orderNo}</b> • ₹{confirmed.amount.toLocaleString("en-IN")} paid.</p>
            <p className="text-xs text-slate-500 mt-1">Track status in My Account → My Orders.</p>
            <div className="mt-4 flex gap-2 justify-center">
              <Link href="/account" className="btn-primary">My Orders →</Link>
              <button onClick={() => setConfirmed(null)} className="btn-ghost">Continue Shopping</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
