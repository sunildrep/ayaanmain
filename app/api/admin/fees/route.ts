import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

const FALLBACK: Record<string, Record<string, number>> = {
  SI: { Residential: 35000, Offline: 25000, Online: 15000 },
  Constable: { Residential: 28000, Offline: 18000, Online: 10800 },
  Groups: { Residential: 32000, Offline: 22000, Online: 13200 },
  "SSC GD": { Residential: 25000, Offline: 15000, Online: 9000 },
  Defence: { Residential: 30000, Offline: 20000, Online: 12000 },
  Army: { Residential: 30000, Offline: 20000, Online: 12000 },
  UPSC: { Residential: 75000, Offline: 45000, Online: 27000 },
};

function fallbackList() {
  const list: any[] = [];
  for (const course of Object.keys(FALLBACK)) {
    for (const mode of Object.keys(FALLBACK[course])) {
      list.push({ id: `${course}-${mode}---`, course, mode, duration: "", medium: "", branch: "", amount: FALLBACK[course][mode], _fallback: true });
    }
  }
  return list;
}

function dim(v: any) {
  return v === undefined || v === null ? "" : String(v);
}

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin", "finance"]);
  if (auth.error) return auth.error;
  const fees = await prisma.feeConfig.findMany({ orderBy: [{ course: "asc" }, { mode: "asc" }, { duration: "asc" }, { medium: "asc" }, { branch: "asc" }] });
  if (fees.length === 0) return NextResponse.json(fallbackList(), { headers: { "Cache-Control": "no-store" } });
  return NextResponse.json(fees, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin"]);
  if (auth.error) return auth.error;
  const body = await req.json();

  // bulk save: { fees: [{course, mode, duration?, medium?, branch?, amount}] }
  // empty/null amount deletes that specific row (falls back up the chain)
  if (Array.isArray(body.fees)) {
    const results = [];
    let deleted = 0;
    for (const f of body.fees) {
      if (!f.course || !f.mode) continue;
      const course = String(f.course);
      const mode = String(f.mode);
      const duration = dim(f.duration);
      const medium = dim(f.medium);
      const branch = dim(f.branch);
      if (f.amount === undefined || f.amount === null || f.amount === "") {
        await prisma.feeConfig.deleteMany({ where: { course, mode, duration, medium, branch } });
        deleted++;
        continue;
      }
      const amount = Math.max(0, Math.round(Number(f.amount)));
      if (isNaN(amount)) continue;
      const rec = await prisma.feeConfig.upsert({
        where: { course_mode_duration_medium_branch: { course, mode, duration, medium, branch } },
        update: { amount },
        create: { course, mode, duration, medium, branch, amount },
      });
      results.push(rec);
    }
    return NextResponse.json({ ok: true, count: results.length, deleted, fees: results });
  }

  const { course, mode, duration, medium, branch, amount, id } = body;
  if (!course || !mode || amount === undefined) return NextResponse.json({ error: "course, mode, amount required" }, { status: 400 });
  const amt = Math.max(0, Math.round(Number(amount)));
  const dur = dim(duration);
  const med = dim(medium);
  const br = dim(branch);
  try {
    if (id) {
      const updated = await prisma.feeConfig.update({ where: { id }, data: { course: String(course), mode: String(mode), duration: dur, medium: med, branch: br, amount: amt } });
      return NextResponse.json(updated);
    }
    const rec = await prisma.feeConfig.upsert({
      where: { course_mode_duration_medium_branch: { course: String(course), mode: String(mode), duration: dur, medium: med, branch: br } },
      update: { amount: amt },
      create: { course: String(course), mode: String(mode), duration: dur, medium: med, branch: br, amount: amt },
    });
    return NextResponse.json(rec);
  } catch (e: any) {
    if (e?.code === "P2002") return NextResponse.json({ error: "A fee already exists for this course + mode + duration + medium + branch" }, { status: 400 });
    throw e;
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin"]);
  if (auth.error) return auth.error;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.feeConfig.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin"]);
  if (auth.error) return auth.error;
  const body = await req.json();
  const { id, course, mode, duration, medium, branch, amount } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const data: any = {};
  if (course !== undefined) data.course = String(course);
  if (mode !== undefined) data.mode = String(mode);
  if (duration !== undefined) data.duration = String(duration);
  if (medium !== undefined) data.medium = String(medium);
  if (branch !== undefined) data.branch = String(branch);
  if (amount !== undefined) data.amount = Math.max(0, Math.round(Number(amount)));
  try {
    const updated = await prisma.feeConfig.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (e: any) {
    if (e?.code === "P2002") return NextResponse.json({ error: "A fee already exists for this course + mode + duration + medium + branch" }, { status: 400 });
    throw e;
  }
}
