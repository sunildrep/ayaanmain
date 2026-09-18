import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const slides = await prisma.carouselSlide.findMany({ where: { active: true }, orderBy: { order: "asc" } });
    if (slides.length === 0) return NextResponse.json([], { headers: { "Cache-Control": "no-store" } });
    return NextResponse.json(slides, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json([], { headers: { "Cache-Control": "no-store" } });
  }
}
