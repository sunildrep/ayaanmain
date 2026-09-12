import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin", "admissions"]);
  if (auth.error) return auth.error;
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(leads, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin", "admissions"]);
  if (auth.error) return auth.error;
  const body = await req.json();

  // bulk import: body is array or { leads: [] }
  if (Array.isArray(body) || Array.isArray(body.leads)) {
    const arr = Array.isArray(body) ? body : body.leads;
    const created: any[] = [];
    for (const item of arr) {
      if (!item.name || !item.phone) continue;
      // dedup by phone
      const existing = await prisma.lead.findFirst({ where: { phone: String(item.phone).trim() } });
      if (existing) continue;
      const lead = await prisma.lead.create({
        data: {
          name: String(item.name).trim(),
          phone: String(item.phone).trim(),
          course: String(item.course || ""),
          medium: String(item.medium || ""),
          mode: String(item.mode || ""),
          batchId: item.batchId || null,
          status: String(item.status || "new"),
          notes: item.notes ? String(item.notes).slice(0, 1000) : null,
          freeText: item.freeText ? String(item.freeText).slice(0, 2000) : null,
          employeeName: item.employeeName ? String(item.employeeName).trim() : null,
          dueDate: item.dueDate ? new Date(item.dueDate) : null,
          lastActionAt: new Date(),
        },
      });
      created.push(lead);
    }
    return NextResponse.json({ ok: true, imported: created.length, leads: created });
  }

  const { id, status, notes, freeText, employeeName, dueDate } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: any = {};
  if (status !== undefined) data.status = String(status);
  if (notes !== undefined) data.notes = notes ? String(notes).slice(0, 1000) : null;
  if (freeText !== undefined) data.freeText = freeText ? String(freeText).slice(0, 2000) : null;
  if (employeeName !== undefined) data.employeeName = employeeName ? String(employeeName).trim().slice(0, 100) : null;
  if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;
  // always bump lastActionAt when any field changes
  data.lastActionAt = new Date();

  await prisma.lead.update({ where: { id }, data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin", "admissions"]);
  if (auth.error) return auth.error;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.lead.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin", "admissions"]);
  if (auth.error) return auth.error;
  const body = await req.json();
  const { id, name, phone, course, medium, mode, batchId, status, notes, freeText, employeeName, dueDate } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const data: any = {};
  if (name !== undefined) data.name = String(name).trim();
  if (phone !== undefined) data.phone = String(phone).trim();
  if (course !== undefined) data.course = String(course);
  if (medium !== undefined) data.medium = String(medium);
  if (mode !== undefined) data.mode = String(mode);
  if (batchId !== undefined) data.batchId = batchId || null;
  if (status !== undefined) data.status = String(status);
  if (notes !== undefined) data.notes = notes ? String(notes).slice(0, 1000) : null;
  if (freeText !== undefined) data.freeText = freeText ? String(freeText).slice(0, 2000) : null;
  if (employeeName !== undefined) data.employeeName = employeeName ? String(employeeName).trim() : null;
  if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;
  data.lastActionAt = new Date();
  const updated = await prisma.lead.update({ where: { id }, data });
  return NextResponse.json(updated);
}
