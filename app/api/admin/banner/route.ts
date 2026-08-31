import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const isAdmin = req.cookies.get("ayaan_session")?.value;
  if (isAdmin) {
    const auth = await requireAdminSession(req, ["super_admin"]);
    if (auth.error) return auth.error;
  }
  const banner = await prisma.banner.findUnique({ where: { id: "main" } });
  return NextResponse.json(banner || { enabled: false, message: "", type: "info", link: "" }, { headers: { "Cache-Control": "no-store" } });
}
export async function POST(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin"]);
  if (auth.error) return auth.error;
  const body = await req.json();
  const data = await prisma.banner.upsert({
    where: { id: "main" },
    update: { enabled: !!body.enabled, message: String(body.message || "").slice(0, 300), type: ["info", "warning", "success", "urgent"].includes(body.type) ? body.type : "info", link: String(body.link || "").slice(0, 200) },
    create: { id: "main", enabled: !!body.enabled, message: String(body.message || "").slice(0, 300), type: ["info", "warning", "success", "urgent"].includes(body.type) ? body.type : "info", link: String(body.link || "").slice(0, 200) },
  });
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}
