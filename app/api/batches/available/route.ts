import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public: only active + open batches with seats left, filterable by course/duration/branch
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const course = searchParams.get("course") || "";
    const months = searchParams.get("months") ? Number(searchParams.get("months")) : null;
    const branch = searchParams.get("branch") || "";
    const where: any = { isActive: true, status: "open" };
    if (course) where.course = course;
    if (branch) where.branch = branch;
    if (months) where.durationMonths = months;
    const list = await prisma.batch.findMany({ where, orderBy: { startDate: "asc" } });
    const available = list
      .filter((b) => b.filled < b.seats)
      .map((b) => ({ ...b, availableSeats: b.seats - b.filled }));
    return NextResponse.json(available, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json([], { headers: { "Cache-Control": "no-store" } });
  }
}
