import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const usersPath = path.join(process.cwd(), "data", "users.json");
const admPath = path.join(process.cwd(), "data", "admissions.json");

function readJson(p: string, fallback: any) { try { return JSON.parse(fs.readFileSync(p, "utf-8")); } catch { return fallback; } }

export async function GET(req: NextRequest) {
  const uid = req.cookies.get("ayaan_user")?.value;
  if (!uid) return NextResponse.json({ authenticated: false }, { headers: { "Cache-Control": "no-store" } });
  const users = readJson(usersPath, []);
  const user = users.find((u: any) => u.id === uid);
  if (!user) return NextResponse.json({ authenticated: false }, { headers: { "Cache-Control": "no-store" } });
  const admissions = readJson(admPath, []);
  const admission = admissions.find((a: any) => a.id === user.admissionId) || admissions.find((a: any) => a.email.toLowerCase() === user.email.toLowerCase()) || null;
  return NextResponse.json({ authenticated: true, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, course: user.course, medium: user.medium, mode: user.mode, createdAt: user.createdAt }, admission }, { headers: { "Cache-Control": "no-store" } });
}
