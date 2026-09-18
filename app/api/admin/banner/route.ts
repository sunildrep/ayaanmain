import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const banner = await prisma.banner.findUnique({ where: { id: "main" } });
  return NextResponse.json(banner || { enabled: false, message: "", type: "info", link: "" }, { headers: { "Cache-Control": "no-store" } });
}
export async function POST(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin"]);
  if (auth.error) return auth.error;
  const body = await req.json();
  const rawLink = String(body.link || "").trim().slice(0, 200);
  let safeLink = "";
  if (rawLink) {
    // Allow only relative paths or https URLs; block javascript:, data:, //evil
    if (rawLink.startsWith("/") && !rawLink.startsWith("//")) safeLink = rawLink;
    else {
      try {
        const u = new URL(rawLink);
        if (u.protocol === "https:" || u.protocol === "http:") safeLink = rawLink;
        else safeLink = "";
      } catch { safeLink = ""; }
      if (rawLink.toLowerCase().includes("javascript:") || rawLink.toLowerCase().startsWith("data:")) safeLink = "";
    }
  }
  const data = await prisma.banner.upsert({
    where: { id: "main" },
    update: { enabled: !!body.enabled, message: String(body.message || "").slice(0, 300), type: ["info", "warning", "success", "urgent"].includes(body.type) ? body.type : "info", link: safeLink },
    create: { id: "main", enabled: !!body.enabled, message: String(body.message || "").slice(0, 300), type: ["info", "warning", "success", "urgent"].includes(body.type) ? body.type : "info", link: safeLink },
  });
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}
