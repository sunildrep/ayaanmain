import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const rows = await prisma.alumni.findMany({ orderBy: { createdAt: "desc" } });
    // Map to legacy shape expected by frontend
    const data = rows.map((r) => ({
      id: r.id,
      name: r.name,
      role: r.role || "",
      batch: r.batch || "",
      course: r.course,
      quote: r.quote,
      video: r.video || "",
      image: r.image || "",
      featured: r.featured,
      createdAt: r.createdAt.toISOString(),
    }));
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json([], { headers: { "Cache-Control": "no-store" } });
  }
}
