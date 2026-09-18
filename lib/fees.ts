// Central fee fallback — single source of truth for all fee defaults.
// All fee calculations fall back to this map when no FeeConfig row exists.
// Chain: exact (course×mode×duration×medium×branch) → peel branch → peel medium → peel duration → base ("","","") → hardcoded fallback
export const FALLBACK_FEE: Record<string, Record<string, number>> = {
  SI: { Residential: 35000, Offline: 25000, Online: 15000 },
  Constable: { Residential: 28000, Offline: 18000, Online: 10800 },
  Groups: { Residential: 32000, Offline: 22000, Online: 13200 },
  "SSC GD": { Residential: 25000, Offline: 15000, Online: 9000 },
  Defence: { Residential: 30000, Offline: 20000, Online: 12000 },
  Army: { Residential: 30000, Offline: 20000, Online: 12000 },
  UPSC: { Residential: 75000, Offline: 45000, Online: 27000 },
};

export function fallbackFee(course: string, mode: string): number {
  if (FALLBACK_FEE[course]?.[mode] !== undefined) return FALLBACK_FEE[course][mode];
  const baseMap: Record<string, number> = {
    SI: 25000,
    Constable: 18000,
    Groups: 22000,
    "SSC GD": 15000,
    Defence: 20000,
    Army: 20000,
    UPSC: 45000,
  };
  let base = baseMap[course] ?? 15000;
  if (mode === "Residential") base += 10000;
  if (mode === "Online") base = Math.round(base * 0.6);
  return base;
}

export function fallbackList(): { course: string; mode: string; duration: string; medium: string; branch: string; amount: number }[] {
  const list: { course: string; mode: string; duration: string; medium: string; branch: string; amount: number }[] = [];
  for (const course of Object.keys(FALLBACK_FEE)) {
    for (const mode of Object.keys(FALLBACK_FEE[course])) {
      list.push({ course, mode, duration: "", medium: "", branch: "", amount: FALLBACK_FEE[course][mode] });
    }
  }
  return list;
}
