import { PrismaClient } from "@prisma/client";
import { newApplicationId, addMonths } from "../lib/identifiers";

const prisma = new PrismaClient();

function parseMonths(s: string | null): number {
  if (!s) return 3;
  const m = s.match(/(\d+)\s*month/i);
  if (m) return Number(m[1]);
  if (/year/i.test(s)) {
    const y = s.match(/(\d+)\s*year/i);
    return (y ? Number(y[1]) : 1) * 12;
  }
  return 3;
}

async function main() {
  // Durations
  const durations = [
    { name: "3 Months", months: 3 },
    { name: "6 Months", months: 6 },
    { name: "1 Year", months: 12 },
    { name: "2 Years", months: 24 },
  ];
  for (const d of durations) {
    await prisma.duration.upsert({ where: { name: d.name }, update: { months: d.months, active: true }, create: { ...d, active: true } });
  }
  console.log(`durations: ${durations.length}`);

  // Backfill batches
  const batches = await prisma.batch.findMany();
  for (const b of batches) {
    const months = b.durationMonths || parseMonths(b.duration);
    await prisma.batch.update({
      where: { id: b.id },
      data: {
        name: b.name || `${b.course} • ${b.medium} • ${b.mode} — ${new Date(b.startDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}`,
        durationMonths: months,
        endDate: b.endDate || addMonths(new Date(b.startDate), months),
        isActive: b.isActive ?? true,
      },
    });
  }
  console.log(`batches backfilled: ${batches.length}`);

  // Backfill applicationIds for legacy admissions
  const missing = await prisma.admission.findMany({ where: { applicationId: null } });
  for (const a of missing) {
    await prisma.admission.update({ where: { id: a.id }, data: { applicationId: await newApplicationId() } });
  }
  console.log(`applicationIds backfilled: ${missing.length}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
