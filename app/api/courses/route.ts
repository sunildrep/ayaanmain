import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      include: { syllabus: true },
      orderBy: { slug: "asc" },
    });
    if (courses.length === 0) {
      // Fallback to hardcoded if DB empty
      const { courseDetails } = await import("@/data/courseDetails");
      return NextResponse.json(courseDetails, { headers: { "Cache-Control": "no-store" } });
    }
    // Transform to match frontend shape
    const transformed = courses.map((c) => ({
      slug: c.slug,
      title: c.title,
      tag: c.tag,
      desc: c.desc,
      duration: c.duration,
      fee: c.fee,
      image: (c as any).image || null,
      eligibility: c.eligibility,
      ageLimit: c.ageLimit,
      notificationDate: c.notificationDate,
      prerequisites: c.prerequisites,
      highlights: c.highlights,
      medium: c.mediums,
      mode: c.modes,
      syllabus: c.syllabus.map((s) => ({ subject: s.subject, topics: s.topics })),
    }));
    return NextResponse.json(transformed, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    const { courseDetails } = await import("@/data/courseDetails");
    return NextResponse.json(courseDetails, { headers: { "Cache-Control": "no-store" } });
  }
}
