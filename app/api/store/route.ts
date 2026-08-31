import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
const p = path.join(process.cwd(), "data", "store.json");
export async function GET() {
  try {
    const data = JSON.parse(fs.readFileSync(p, "utf-8"));
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json([], { headers: { "Cache-Control": "no-store" } });
  }
}
