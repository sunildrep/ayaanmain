import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const batches = await prisma.batch.findMany({ where: { status: "open" }, orderBy: { startDate: "asc" } });
  return NextResponse.json(batches);
}