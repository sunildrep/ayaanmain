import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const p = path.join(process.cwd(), "data", "banner.json");
  try {
    const data = JSON.parse(fs.readFileSync(p, "utf-8"));
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
      },
    });
  } catch {
    return NextResponse.json({ enabled: false, message: "" }, {
      headers: { "Cache-Control": "no-store" },
    });
  }
}
