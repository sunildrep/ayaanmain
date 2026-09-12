import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const list = await prisma.duration.findMany({ where: { active: true }, orderBy: { months: "asc" } });
    return NextResponse.json(list, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json([], { headers: { "Cache-Control": "no-store" } });
  }
}
