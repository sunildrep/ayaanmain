import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public fee list for admission form — no auth needed
const FALLBACK: Record<string, Record<string, number>> = {
  SI: { Residential: 35000, Offline: 25000, Online: 15000 },
  Constable: { Residential: 28000, Offline: 18000, Online: 10800 },
  Groups: { Residential: 32000, Offline: 22000, Online: 13200 },
  "SSC GD": { Residential: 25000, Offline: 15000, Online: 9000 },
  Defence: { Residential: 30000, Offline: 20000, Online: 12000 },
  Army: { Residential: 30000, Offline: 20000, Online: 12000 },
  UPSC: { Residential: 75000, Offline: 45000, Online: 27000 },
};

function fallbackList() {
  const list: { course: string; mode: string; duration: string; medium: string; branch: string; amount: number }[] = [];
  for (const course of Object.keys(FALLBACK)) {
    for (const mode of Object.keys(FALLBACK[course])) {
      list.push({ course, mode, duration: "", medium: "", branch: "", amount: FALLBACK[course][mode] });
    }
  }
  return list;
}

export async function GET() {
  try {
    const fees = await prisma.feeConfig.findMany({ orderBy: [{ course: "asc" }, { mode: "asc" }, { duration: "asc" }, { medium: "asc" }, { branch: "asc" }] });
    if (fees.length === 0) return NextResponse.json(fallbackList(), { headers: { "Cache-Control": "no-store" } });
    return NextResponse.json(fees.map((f) => ({ course: f.course, mode: f.mode, duration: f.duration, medium: f.medium, branch: f.branch, amount: f.amount, id: f.id, updatedAt: f.updatedAt })), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(fallbackList(), { headers: { "Cache-Control": "no-store" } });
  }
}
