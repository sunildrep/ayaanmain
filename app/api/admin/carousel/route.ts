import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/identifiers";

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin"]);
  if (auth.error) return auth.error;
  const slides = await prisma.carouselSlide.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(slides, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin"]);
  if (auth.error) return auth.error;
  const body = await req.json();
  const { id, image, badge, title, highlight, desc, ctaLabel, ctaHref, cta2Label, cta2Href, accent, order, active } = body;
  if (!image || !String(image).trim()) return NextResponse.json({ error: "Image required (URL or uploaded path)" }, { status: 400 });

  const data: any = {
    image: String(image).trim(),
    badge: String(badge || "").trim(),
    title: String(title || "").trim(),
    highlight: String(highlight || "").trim(),
    desc: String(desc || "").trim(),
    ctaLabel: String(ctaLabel || "").trim(),
    ctaHref: String(ctaHref || "").trim(),
    cta2Label: cta2Label ? String(cta2Label).trim() : null,
    cta2Href: cta2Href ? String(cta2Href).trim() : null,
    accent: String(accent || "from-sky-600 to-navy-900").trim(),
    order: order !== undefined ? Math.max(0, parseInt(String(order), 10) || 0) : 0,
    active: active !== undefined ? !!active : true,
  };
  if (id) {
    const updated = await prisma.carouselSlide.update({ where: { id: String(id) }, data });
    await audit("carousel", updated.id, auth.session.username || auth.session.userId, "update", updated.title);
    return NextResponse.json(updated);
  }
  // auto order = max+1 if not provided
  if (body.order === undefined) {
    const max = await prisma.carouselSlide.aggregate({ _max: { order: true } });
    data.order = (max._max.order ?? -1) + 1;
  }
  const created = await prisma.carouselSlide.create({ data });
  await audit("carousel", created.id, auth.session.username || auth.session.userId, "create", created.title);
  return NextResponse.json(created);
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin"]);
  if (auth.error) return auth.error;
  const body = await req.json();
  const { id, order, active } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const data: any = {};
  if (order !== undefined) data.order = Math.max(0, parseInt(String(order), 10) || 0);
  if (active !== undefined) data.active = !!active;
  if (Object.keys(data).length === 0) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  const updated = await prisma.carouselSlide.update({ where: { id: String(id) }, data });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin"]);
  if (auth.error) return auth.error;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.carouselSlide.delete({ where: { id } });
  await audit("carousel", id, auth.session.username || auth.session.userId, "delete", "Carousel slide deleted");
  return NextResponse.json({ ok: true });
}
