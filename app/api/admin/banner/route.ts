import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "banner.json");

function read() {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return { enabled: false, message: "", type: "info", link: "", updatedAt: new Date().toISOString() };
  }
}

export async function GET() {
  return NextResponse.json(read(), {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(req: NextRequest) {
  const isAdmin = req.cookies.get("ayaan_admin")?.value === "1";
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = {
    enabled: !!body.enabled,
    message: String(body.message || "").slice(0, 300),
    type: ["info", "warning", "success", "urgent"].includes(body.type) ? body.type : "info",
    link: String(body.link || "").slice(0, 200),
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store" },
  });
}
