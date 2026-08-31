import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin", "finance"]);
  if (auth.error) return auth.error;
  const expenses = await prisma.expense.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(expenses, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin", "finance"]);
  if (auth.error) return auth.error;
  const body = await req.json();
  const { id, title, category, amount, dueDate, status, vendor, notes } = body;
  if (!title || amount === undefined) return NextResponse.json({ error: "title and amount required" }, { status: 400 });
  const item = await prisma.expense.upsert({
    where: { id: id || "" },
    update: { title: String(title), category: String(category || "General"), amount: Number(amount), dueDate: dueDate ? new Date(dueDate) : new Date(), status: status === "paid" ? "paid" : "pending", vendor: String(vendor || ""), notes: String(notes || "") },
    create: { id: id || `EXP-${Date.now()}`, title: String(title), category: String(category || "General"), amount: Number(amount), dueDate: dueDate ? new Date(dueDate) : new Date(), status: status === "paid" ? "paid" : "pending", vendor: String(vendor || ""), notes: String(notes || "") },
  });
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin", "finance"]);
  if (auth.error) return auth.error;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.expense.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
