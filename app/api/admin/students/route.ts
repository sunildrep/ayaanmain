import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const usersPath = path.join(process.cwd(), "data", "users.json");
function readUsers() { try { return JSON.parse(fs.readFileSync(usersPath, "utf-8")); } catch { return []; } }
function writeUsers(list: any[]) { fs.writeFileSync(usersPath, JSON.stringify(list, null, 2)); }
function hash(pw: string) { return crypto.createHash("sha256").update(pw).digest("hex"); }
function check(req: NextRequest, allowed: string[]) {
  const r = req.cookies.get("ayaan_admin_role")?.value || "super_admin";
  return allowed.includes(r);
}

export async function GET(req: NextRequest) {
  if (req.cookies.get("ayaan_admin")?.value !== "1") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // finance needs read for payments dropdown, admissions needs full
  if (!check(req, ["super_admin", "admissions", "finance"])) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const users = readUsers();
  return NextResponse.json(users, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  if (req.cookies.get("ayaan_admin")?.value !== "1") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!check(req, ["super_admin", "admissions"])) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const { id, action, password, name, fatherName, email, phone, address, reference, branch, course, courseType, medium, mode, active } = body;

  // create new student directly
  if (action === "create") {
    if (!name || !email || !phone || !password) return NextResponse.json({ error: "name, email, phone, password required" }, { status: 400 });
    if (!/^[0-9]{10}$/.test(String(phone))) return NextResponse.json({ error: "phone must be 10 digits" }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: "password min 6 chars" }, { status: 400 });
    const users = readUsers();
    if (users.find((u: any) => u.email.toLowerCase() === String(email).toLowerCase())) return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    const user = {
      id: `USR-${Date.now()}`,
      name: String(name).trim(),
      fatherName: String(fatherName || "").trim(),
      email: String(email).trim().toLowerCase(),
      phone: String(phone).trim(),
      address: String(address || "").trim(),
      reference: String(reference || "").trim(),
      branch: String(branch || ""),
      course: String(course || "SI"),
      courseType: String(courseType || "Regular"),
      medium: String(medium || "Telugu"),
      mode: String(mode || "Residential"),
      passwordHash: hash(String(password)),
      admissionId: null,
      createdAt: new Date().toISOString(),
      active: true,
    };
    users.unshift(user);
    writeUsers(users);
    return NextResponse.json({ ok: true, user });
  }

  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const users = readUsers();
  const idx = users.findIndex((u: any) => u.id === id);
  if (idx === -1) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (action === "toggleActive") {
    users[idx].active = active !== undefined ? !!active : !users[idx].active;
    if (users[idx].active === undefined) users[idx].active = true;
  } else if (action === "resetPassword") {
    if (!password || password.length < 6) return NextResponse.json({ error: "Password min 6 chars" }, { status: 400 });
    users[idx].passwordHash = hash(String(password));
  } else if (action === "update") {
    if (name) users[idx].name = String(name);
    if (fatherName !== undefined) users[idx].fatherName = String(fatherName);
    if (email) users[idx].email = String(email).toLowerCase();
    if (phone) users[idx].phone = String(phone);
    if (address !== undefined) users[idx].address = String(address);
    if (reference !== undefined) users[idx].reference = String(reference);
    if (branch !== undefined) users[idx].branch = String(branch);
    if (course) users[idx].course = String(course);
    if (courseType !== undefined) users[idx].courseType = String(courseType);
    if (medium) users[idx].medium = String(medium);
    if (mode) users[idx].mode = String(mode);
  } else if (action === "delete") {
    users.splice(idx, 1);
    writeUsers(users);
    return NextResponse.json({ ok: true });
  } else {
    return NextResponse.json({ error: "unknown action" }, { status: 400 });
  }
  writeUsers(users);
  return NextResponse.json({ ok: true, user: users[idx] });
}
