import { NextRequest, NextResponse } from "next/server";

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "Ayaan@2026";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const res = NextResponse.json({ ok: true });
    // httpOnly cookie for 8 hours
    res.cookies.set("ayaan_admin", "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    return res;
  }
  return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("ayaan_admin", "", { path: "/", maxAge: 0 });
  return res;
}

export async function GET(req: NextRequest) {
  const c = req.cookies.get("ayaan_admin")?.value;
  return NextResponse.json({ authenticated: c === "1" });
}
