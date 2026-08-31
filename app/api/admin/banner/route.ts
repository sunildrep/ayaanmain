import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
const filePath = path.join(process.cwd(), "data", "banner.json");
function read() {
  try { return JSON.parse(fs.readFileSync(filePath, "utf-8")); } catch { return { enabled: false, message: "", type: "info", link: "", updatedAt: new Date().toISOString() }; }
}
function check(req: NextRequest) {
  const r = req.cookies.get("ayaan_admin_role")?.value || "super_admin";
  return r === "super_admin";
}
export async function GET(req: NextRequest) {
  if (req.cookies.get("ayaan_admin")?.value === "1" && !check(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json(read(), { headers: { "Cache-Control": "no-store" } });
}
export async function POST(req: NextRequest) {
  if (req.cookies.get("ayaan_admin")?.value !== "1") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!check(req)) return NextResponse.json({ error: "Forbidden: super_admin only" }, { status: 403 });
  const body = await req.json();
  const data = {
    enabled: !!body.enabled,
    message: String(body.message || "").slice(0, 300),
    type: ["info", "warning", "success", "urgent"].includes(body.type) ? body.type : "info",
    link: String(body.link || "").slice(0, 200),
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}
