import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const banner = await prisma.banner.findUnique({ where: { id: "main" } });
  return NextResponse.json(banner || { enabled: false, message: "" }, {
    headers: { "Cache-Control": "no-store, no-cache, must-revalidate", "Pragma": "no-cache" },
  });
}