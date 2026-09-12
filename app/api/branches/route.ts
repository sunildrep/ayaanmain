import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const FALLBACK = [
  { id: "warangal", name: "Warangal — Residential Academy", address: "Don Bosco School, Opp. Vaagdevi College, Bollikunta, Warangal 506005", phone: "+91 88866 67222" },
  { id: "hanamkonda", name: "Hanamkonda", address: "2nd Floor, Mayuri Mall, Kishanpura, Hanamkonda, Warangal 506001", phone: "+91 88866 67222" },
  { id: "hyderabad", name: "Hyderabad — Dilsukhnagar", address: "Chenna Complex, Near Metro Pillar 1542, Dilsukhnagar, Hyderabad", phone: "+91 88866 67222" },
];

export async function GET() {
  try {
    const branches = await prisma.branch.findMany({ where: { active: true }, orderBy: { name: "asc" } });
    if (branches.length === 0) return NextResponse.json(FALLBACK, { headers: { "Cache-Control": "no-store" } });
    return NextResponse.json(branches, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json(FALLBACK, { headers: { "Cache-Control": "no-store" } });
  }
}
