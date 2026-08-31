import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const admPath = path.join(process.cwd(), "data", "admissions.json");
const usersPath = path.join(process.cwd(), "data", "users.json");

function read(p: string, fallback: any) { try { return JSON.parse(fs.readFileSync(p, "utf-8")); } catch { return fallback; } }

// fee map for AR estimation if amount not stored
const feeMap: Record<string, number> = {
  "SI": 25000,
  "Constable": 18000,
  "Groups": 22000,
  "SSC GD": 15000,
  "Defence": 20000,
  "Army": 20000,
  "UPSC": 45000,
};

function getFee(course: string, mode: string) {
  let base = feeMap[course] || 15000;
  if (mode === "Residential") base += 10000; // hostel
  if (mode === "Online") base = Math.round(base * 0.6);
  return base;
}

function checkRole(req: NextRequest, allowed: string[]) {
  const role = req.cookies.get("ayaan_admin_role")?.value || "super_admin";
  if (!allowed.includes(role)) return false;
  return true;
}

export async function POST(req: NextRequest) {
  if (req.cookies.get("ayaan_admin")?.value !== "1") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!checkRole(req, ["super_admin", "finance"])) return NextResponse.json({ error: "Forbidden: finance only" }, { status: 403 });
  const body = await req.json();
  const { name, phone, email, course, medium, mode, amount, paidAmount, dueDate, paymentMethod, transactionId, studentId, createStudent, password, fatherName, address, branch, courseType } = body;
  if (!name || !phone || !email || !course || !amount) return NextResponse.json({ error: "name, phone, email, course, amount required" }, { status: 400 });
  if (!/^[0-9]{10}$/.test(String(phone))) return NextResponse.json({ error: "phone must be 10 digits" }, { status: 400 });

  // auto-create student if not exists and requested
  const users = read(usersPath, []);
  let user = users.find((u: any) => u.email.toLowerCase() === String(email).toLowerCase() || u.phone === String(phone));
  let createdUserId: string | null = null;
  let generatedPassword: string | null = null;
  if (!user && (createStudent || studentId === "new")) {
    const pw = String(password || "").trim() || `Ayaan@${String(phone).slice(-4)}`;
    if (pw.length < 6) return NextResponse.json({ error: "Password min 6 chars for new student" }, { status: 400 });
    const crypto = await import("crypto");
    const hash = crypto.createHash("sha256").update(pw).digest("hex");
    user = {
      id: `USR-${Date.now()}`,
      name: String(name).trim(),
      fatherName: String(fatherName || "").trim(),
      email: String(email).trim().toLowerCase(),
      phone: String(phone).trim(),
      address: String(address || "").trim(),
      branch: String(branch || ""),
      course: String(course),
      courseType: String(courseType || "Regular"),
      medium: String(medium || "Telugu"),
      mode: String(mode || "Offline"),
      passwordHash: hash,
      admissionId: null,
      createdAt: new Date().toISOString(),
      active: true,
    };
    users.unshift(user);
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
    createdUserId = user.id;
    generatedPassword = pw;
  } else if (studentId && studentId !== "new") {
    // if picking existing student, ensure user exists
    const existing = users.find((u: any) => u.id === studentId);
    if (existing) {
      // use existing email/phone if not provided
      createdUserId = existing.id;
    }
  }

  const admissions = read(admPath, []);
  const id = `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 4).toUpperCase()}`;
  const entry = {
    id,
    name: String(name).trim(),
    phone: String(phone).trim(),
    email: String(email).trim().toLowerCase(),
    course: String(course),
    medium: String(medium || "Telugu"),
    mode: String(mode || "Offline"),
    amount: Number(amount),
    paidAmount: paidAmount !== undefined && paidAmount !== "" ? Math.min(Number(amount), Number(paidAmount)) : Number(amount),
    dueDate: dueDate ? String(dueDate) : null,
    paymentMethod: String(paymentMethod || "cash").toLowerCase(),
    transactionId: transactionId ? String(transactionId).trim() : null,
    screenshot: null,
    status: paidAmount !== undefined && Number(paidAmount) < Number(amount) ? "pending" : "approved",
    createdAt: new Date().toISOString(),
    approvedAt: Number(paidAmount) >= Number(amount) ? new Date().toISOString() : null,
    manual: true,
    studentId: createdUserId || (user ? user.id : null),
  };
  admissions.unshift(entry);
  fs.writeFileSync(admPath, JSON.stringify(admissions, null, 2));
  return NextResponse.json({ ok: true, id, studentId: createdUserId, generatedPassword });
}

export async function GET(req: NextRequest) {
  if (req.cookies.get("ayaan_admin")?.value !== "1") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!checkRole(req, ["super_admin", "finance"])) return NextResponse.json({ error: "Forbidden: finance only" }, { status: 403 });
  const admissions = read(admPath, []);
  const users = read(usersPath, []);

  const payments = admissions.map((a: any) => {
    const fee = a.feeAmount || a.amount || getFee(a.course, a.mode);
    // support partial payments: paidAmount vs balance
    const paidAmount = a.paidAmount !== undefined ? Number(a.paidAmount) : (a.status === "approved" || (a.paymentMethod !== "cash" && !!a.transactionId) ? fee : 0);
    const isPaid = paidAmount >= fee;
    const balance = Math.max(0, fee - paidAmount);
    // AR: receivable vs collected
    return {
      id: a.id,
      admissionId: a.id,
      student: a.name,
      email: a.email,
      phone: a.phone,
      course: a.course,
      medium: a.medium,
      mode: a.mode,
      amount: fee,
      paidAmount,
      balance,
      paymentMethod: a.paymentMethod,
      transactionId: a.transactionId,
      status: isPaid ? "collected" : balance > 0 && balance < fee ? "partial" : a.status === "pending" && a.paymentMethod === "cash" ? "pending_cash" : a.paymentMethod !== "cash" && a.transactionId ? "pending_verification" : "pending",
      collected: paidAmount,
      receivable: fee,
      createdAt: a.createdAt,
      dueDate: a.dueDate || null,
      screenshot: !!a.screenshot,
      approved: a.status === "approved",
    };
  });

  const totalReceivable = payments.reduce((s: number, p: any) => s + p.receivable, 0);
  const totalCollected = payments.reduce((s: number, p: any) => s + p.collected, 0);
  const totalPending = totalReceivable - totalCollected;

  return NextResponse.json({ payments, totals: { totalReceivable, totalCollected, totalPending, count: payments.length }, usersCount: users.length }, { headers: { "Cache-Control": "no-store" } });
}
