import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const p = path.join(process.cwd(), "data", "batches.json");
  try {
    const data = JSON.parse(fs.readFileSync(p, "utf-8"));
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([]);
  }
}
