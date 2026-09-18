// Central dummy images — replace with real uploads via Admin later
// All URLs are public Unsplash/Picsum with ?q=80&w=... — change in Admin → Carousel/Courses/Store/Alumni
export const DUMMY = {
  // Courses — by slug
  course: {
    si: "https://images.unsplash.com/photo-1542395975-d6d3f2761a28?q=80&w=800&auto=format&fit=crop",
    constable: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
    groups: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop",
    "ssc-gd": "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?q=80&w=800&auto=format&fit=crop",
    army: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop",
    upsc: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop",
    online: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop",
    fallback: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=800&auto=format&fit=crop",
  },
  campus: {
    warangal: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop",
    hanamkonda: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=800&auto=format&fit=crop",
    hyderabad: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop",
    bollikunta: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop",
  },
  store: {
    shoes: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop",
    apparel: "https://images.unsplash.com/photo-1521572163474-3ad99e3fd2b6?q=80&w=600&auto=format&fit=crop",
    gear: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop",
    fallback: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=600&auto=format&fit=crop",
  },
  alumni: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f3f?q=80&w=400&auto=format&fit=crop",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop",
  academy: "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1200&auto=format&fit=crop",
  placeholder: (text: string, w = 800, h = 600) => `https://via.placeholder.com/${w}x${h}?text=${encodeURIComponent(text)}`,
};

export const dummyForCourse = (slug: string) => (DUMMY.course as any)[slug] || DUMMY.course.fallback;
export const dummyForStore = (cat: string) => {
  const c = String(cat || "").toLowerCase();
  if (c.includes("shoe") || c.includes("boot") || c.includes("spike")) return DUMMY.store.shoes;
  if (c.includes("shirt") || c.includes("jacket") || c.includes("apparel") || c.includes("tshirt")) return DUMMY.store.apparel;
  if (c.includes("bag") || c.includes("rucksack") || c.includes("gear")) return DUMMY.store.gear;
  return DUMMY.store.fallback;
};
