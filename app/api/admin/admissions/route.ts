import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const admPath = path.join(process.cwd(), "data", "admissions.json");
const usersPath = path.join(process.cwd(), "data", "users.json");

function readAdm() { try { return JSON.parse(fs.readFileSync(admPath, "utf-8")); } catch { return []; } }
function writeAdm(list: any[]) { fs.writeFileSync(admPath, JSON.stringify(list, null, 2)); }
function readUsers() { try { return JSON.parse(fs.readFileSync(usersPath, "utf-8")); } catch { return []; } }
function writeUsers(list: any[]) { fs.writeFileSync(usersPath, JSON.stringify(list, null, 2)); }
function hash(pw: string) { return crypto.createHash("sha256").update(pw).digest("hex"); }

export async function GET(req: NextRequest) {
  if (req.cookies.get("ayaan_admin")?.value !== "1") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const list = readAdm();
  return NextResponse.json(list, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  if (req.cookies.get("ayaan_admin")?.value !== "1") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { action, id, password } = body;
  if (!action || !id) return NextResponse.json({ error: "action and id required" }, { status: 400 });

  const list = readAdm();
  const idx = list.findIndex((a: any) => a.id === id);
  if (idx === -1) return NextResponse.json({ error: "Admission not found" }, { status: 404 });

  if (action === "approve") {
    if (list[idx].status === "approved") return NextResponse.json({ error: "Already approved" }, { status: 400 });
    // create user
    const users = readUsers();
    const email = String(list[idx].email).toLowerCase();
    if (users.find((u: any) => u.email.toLowerCase() === email)) return NextResponse.json({ error: "User already exists for this email" }, { status: 400 });
    const pw = String(password || "").trim();
    if (!pw || pw.length < 6) return NextResponse.json({ error: "Password required (min 6 chars) to create account" }, { status: 400 });
    const user = {
      id: `USR-${Date.now()}`,
      name: list[idx].name,
      fatherName: list[idx].fatherName || "",
      phone: list[idx].phone,
      email,
      address: list[idx].address || "",
      reference: list[idx].reference || "",
      branch: list[idx].branch || "",
      course: list[idx].course,
      courseType: list[idx].courseType || "Regular",
      medium: list[idx].medium,
      mode: list[idx].mode,
      passwordHash: hash(pw),
      admissionId: id,
      createdAt: new Date().toISOString(),
      active: true,
    };
    users.unshift(user);
    writeUsers(users);
    list[idx].status = "approved";
    list[idx].approvedAt = new Date().toISOString();
    writeAdm(list);
    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } });
  }

  if (action === "reject") {
    list[idx].status = "rejected";
    list[idx].rejectedAt = new Date().toISOString();
    writeAdm(list);
    return NextResponse.json({ ok: true });
  }

  if (action === "pending") {
    list[idx].status = "pending";
    writeAdm(list);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
