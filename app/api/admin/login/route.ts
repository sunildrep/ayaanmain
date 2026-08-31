import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const fallbackUser = process.env.ADMIN_USER || "admin";
const fallbackPass = process.env.ADMIN_PASS || "Ayaan@2026";

function getAdmins(): any[] {
  try {
    const p = path.join(process.cwd(), "data", "admins.json");
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch {}
  return [{ username: fallbackUser, password: fallbackPass, role: "super_admin", name: "Super Admin" }];
}

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  const admins = getAdmins();
  const user = admins.find((a: any) => a.username === username && a.password === password);
  if (user) {
    const res = NextResponse.json({ ok: true, role: user.role, name: user.name });
    res.cookies.set("ayaan_admin", "1", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 8 });
    res.cookies.set("ayaan_admin_role", user.role, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 8 });
    res.cookies.set("ayaan_admin_user", user.username, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 8 });
    return res;
  }
  return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("ayaan_admin", "", { path: "/", maxAge: 0 });
  res.cookies.set("ayaan_admin_role", "", { path: "/", maxAge: 0 });
  res.cookies.set("ayaan_admin_user", "", { path: "/", maxAge: 0 });
  return res;
}

export async function GET(req: NextRequest) {
  const c = req.cookies.get("ayaan_admin")?.value;
  const role = req.cookies.get("ayaan_admin_role")?.value || "super_admin";
  const user = req.cookies.get("ayaan_admin_user")?.value || "admin";
  return NextResponse.json({ authenticated: c === "1", role, user });
}
