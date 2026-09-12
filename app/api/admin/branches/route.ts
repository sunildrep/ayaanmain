import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin"]);
  if (auth.error) return auth.error;
  const list = await prisma.branch.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(list, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin"]);
  if (auth.error) return auth.error;
  const body = await req.json();
  const { id, name, address, phone, active } = body;
  if (!name || !String(name).trim()) return NextResponse.json({ error: "name required" }, { status: 400 });
  if (!address || !String(address).trim()) return NextResponse.json({ error: "address required" }, { status: 400 });
  const data = {
    name: String(name).trim(),
    address: String(address).trim(),
    phone: phone ? String(phone).trim() : null,
    active: active === undefined ? true : !!active,
  };
  try {
    if (id) {
      const updated = await prisma.branch.update({ where: { id }, data });
      return NextResponse.json(updated);
    }
    const created = await prisma.branch.create({ data });
    return NextResponse.json(created);
  } catch (e: any) {
    if (e?.code === "P2002") return NextResponse.json({ error: "A branch with this name already exists" }, { status: 400 });
    throw e;
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin"]);
  if (auth.error) return auth.error;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const branch = await prisma.branch.findUnique({ where: { id } });
  if (!branch) return NextResponse.json({ error: "Branch not found" }, { status: 404 });
  const usedByBatches = await prisma.batch.count({ where: { branch: branch.name } });
  if (usedByBatches > 0) return NextResponse.json({ error: `Cannot delete — ${usedByBatches} batch(es) use this branch` }, { status: 400 });
  const usedByAdmissions = await prisma.admission.count({ where: { branch: branch.name } });
  if (usedByAdmissions > 0) return NextResponse.json({ error: `Cannot delete — ${usedByAdmissions} admission(s) use this branch` }, { status: 400 });
  await prisma.branch.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
