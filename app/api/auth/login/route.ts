import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const usersPath = path.join(process.cwd(), "data", "users.json");

function readUsers() {
  try { return JSON.parse(fs.readFileSync(usersPath, "utf-8")); } catch { return []; }
}
function hash(pw: string) {
  return crypto.createHash("sha256").update(pw).digest("hex");
}

export async function POST(req: NextRequest) {
  const { email, phone, password } = await req.json();
  const identifier = (email || phone || "").toString().trim().toLowerCase();
  if (!identifier || !password) return NextResponse.json({ error: "email/phone and password required" }, { status: 400 });

  const users = readUsers();
  const user = users.find((u: any) => u.email.toLowerCase() === identifier || u.phone === identifier);
  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  if (user.passwordHash !== hash(String(password))) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const res = NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, course: user.course } });
  res.cookies.set("ayaan_user", user.id, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
  return res;
}
