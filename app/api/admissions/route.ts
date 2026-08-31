import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const admPath = path.join(process.cwd(), "data", "admissions.json");

function readAdm() {
  try { return JSON.parse(fs.readFileSync(admPath, "utf-8")); } catch { return []; }
}
function writeAdm(list: any[]) {
  fs.writeFileSync(admPath, JSON.stringify(list, null, 2));
}

export async function GET(req: NextRequest) {
  // allow user to query own admissions via ?email= or ?phone=
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email")?.toLowerCase();
  const phone = searchParams.get("phone");
  const list = readAdm();
  if (email || phone) {
    const filtered = list.filter((a: any) => (email && a.email.toLowerCase() === email) || (phone && a.phone === phone));
    return NextResponse.json(filtered, { headers: { "Cache-Control": "no-store" } });
  }
  // public shouldn't list all; return limited
  return NextResponse.json([], { headers: { "Cache-Control": "no-store" } });
}

const feeMap: Record<string, number> = { SI: 25000, Constable: 18000, Groups: 22000, "SSC GD": 15000, Defence: 20000, Army: 20000, UPSC: 45000 };
function getFee(course: string, mode: string) {
  let base = feeMap[course] || 15000;
  if (mode === "Residential") base += 10000;
  if (mode === "Online") base = Math.round(base * 0.6);
  return base;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, fatherName, phone, email, address, reference, branch, course, courseType, medium, mode, batchId, paymentMethod, transactionId, screenshot, amount } = body;

  if (!name || !fatherName || !phone || !email || !address || !branch || !course) return NextResponse.json({ error: "name, fatherName, phone, email, address, branch, course required" }, { status: 400 });
  if (!/^[0-9]{10}$/.test(phone)) return NextResponse.json({ error: "phone must be 10 digits" }, { status: 400 });

  const pm = String(paymentMethod || "cash").toLowerCase();
  if (!["cash", "upi", "bank"].includes(pm)) return NextResponse.json({ error: "paymentMethod must be cash|upi|bank" }, { status: 400 });

  if (pm === "upi") {
    if (!transactionId) return NextResponse.json({ error: "UPI requires transaction ID" }, { status: 400 });
    if (!screenshot) return NextResponse.json({ error: "UPI requires screenshot" }, { status: 400 });
  }
  if (pm === "bank" && !transactionId) return NextResponse.json({ error: "Bank transfer requires transaction ID" }, { status: 400 });
  // cash needs nothing

  const list = readAdm();
  const id = `ADM-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const fee = amount ? Number(amount) : getFee(String(course), String(mode || "Residential"));
  const entry = {
    id,
    name: String(name).trim(),
    fatherName: String(fatherName).trim(),
    phone: String(phone).trim(),
    email: String(email).trim().toLowerCase(),
    address: String(address).trim(),
    reference: String(reference || "").trim(),
    branch: String(branch).trim(),
    course: String(course),
    courseType: String(courseType || "Regular"),
    medium: String(medium || "Telugu"),
    mode: String(mode || "Residential"),
    batchId: batchId || null,
    paymentMethod: pm,
    transactionId: transactionId ? String(transactionId).trim() : null,
    screenshot: screenshot ? String(screenshot).slice(0, 500000) : null,
    amount: fee,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  list.unshift(entry);
  writeAdm(list);
  return NextResponse.json({ ok: true, id, status: "pending" });
}
