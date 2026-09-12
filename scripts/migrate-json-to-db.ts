import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

function readJson<T>(file: string): T {
  const p = path.join(process.cwd(), "data", file);
  try {
    return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch {
    return [] as any;
  }
}

async function main() {
  console.log("🔄 Starting migration from JSON to Supabase...\n");

  // 1. Admins
  console.log("📦 Migrating admins...");
  const admins = readJson<any>("admins.json");
  for (const a of admins) {
    await prisma.admin.upsert({
      where: { username: a.username },
      update: { email: a.email, passwordHash: a.passwordHash, role: a.role, name: a.name },
      create: { username: a.username, email: a.email, passwordHash: a.passwordHash, role: a.role, name: a.name },
    });
  }
  console.log(`   ✅ ${admins.length} admins migrated`);

  // 2. Users (students)
  console.log("📦 Migrating users...");
  const users = readJson<any>("users.json");
  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        fatherName: u.fatherName,
        phone: u.phone,
        address: u.address,
        reference: u.reference,
        branch: u.branch,
        course: u.course,
        courseType: u.courseType,
        medium: u.medium,
        mode: u.mode,
        passwordHash: u.passwordHash,
        admissionId: u.admissionId,
        isActive: u.active,
        createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
      },
      create: {
        id: u.id,
        name: u.name,
        fatherName: u.fatherName,
        email: u.email,
        phone: u.phone,
        address: u.address,
        reference: u.reference,
        branch: u.branch,
        course: u.course,
        courseType: u.courseType,
        medium: u.medium,
        mode: u.mode,
        passwordHash: u.passwordHash,
        admissionId: u.admissionId,
        isActive: u.active,
        createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
      },
    });
  }
  console.log(`   ✅ ${users.length} users migrated`);

  // 3. Admissions
  console.log("📦 Migrating admissions...");
  const admissions = readJson<any>("admissions.json");
  for (const a of admissions) {
    await prisma.admission.upsert({
      where: { id: a.id },
      update: {
        name: a.name,
        fatherName: a.fatherName,
        phone: a.phone,
        email: a.email,
        address: a.address,
        reference: a.reference,
        branch: a.branch,
        course: a.course,
        courseType: a.courseType,
        medium: a.medium,
        mode: a.mode,
        batchId: a.batchId,
        paymentMethod: a.paymentMethod,
        transactionId: a.transactionId,
        screenshot: a.screenshot,
        amount: a.amount,
        feeAmount: a.feeAmount,
        status: a.status,
        paidAmount: a.paidAmount,
        dueDate: a.dueDate ? new Date(a.dueDate) : null,
        createdAt: a.createdAt ? new Date(a.createdAt) : new Date(),
        approvedAt: a.approvedAt ? new Date(a.approvedAt) : null,
        rejectedAt: a.rejectedAt ? new Date(a.rejectedAt) : null,
        manual: a.manual,
        studentId: a.studentId,
      },
      create: {
        id: a.id,
        name: a.name,
        fatherName: a.fatherName,
        phone: a.phone,
        email: a.email,
        address: a.address,
        reference: a.reference,
        branch: a.branch,
        course: a.course,
        courseType: a.courseType,
        medium: a.medium,
        mode: a.mode,
        batchId: a.batchId,
        paymentMethod: a.paymentMethod,
        transactionId: a.transactionId,
        screenshot: a.screenshot,
        amount: a.amount,
        feeAmount: a.feeAmount,
        status: a.status,
        paidAmount: a.paidAmount,
        dueDate: a.dueDate ? new Date(a.dueDate) : null,
        createdAt: a.createdAt ? new Date(a.createdAt) : new Date(),
        approvedAt: a.approvedAt ? new Date(a.approvedAt) : null,
        rejectedAt: a.rejectedAt ? new Date(a.rejectedAt) : null,
        manual: a.manual,
        studentId: a.studentId,
      },
    });
  }
  console.log(`   ✅ ${admissions.length} admissions migrated`);

  // 4. Payments
  console.log("📦 Migrating payments...");
  const payments = readJson<any>("payments.json");
  for (const p of payments) {
    await prisma.payment.upsert({
      where: { id: p.id },
      update: {
        admissionId: p.admissionId || p.id,
        studentId: p.studentId,
        name: p.name,
        phone: p.phone,
        email: p.email,
        course: p.course,
        medium: p.medium,
        mode: p.mode,
        amount: p.amount || p.receivable,
        paidAmount: p.paidAmount || p.collected,
        dueDate: p.dueDate ? new Date(p.dueDate) : null,
        paymentMethod: p.paymentMethod,
        transactionId: p.transactionId,
        screenshot: p.screenshot,
        status: p.status,
        createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
        approvedAt: p.approvedAt ? new Date(p.approvedAt) : null,
      },
      create: {
        id: p.id,
        admissionId: p.admissionId || p.id,
        studentId: p.studentId,
        name: p.name,
        phone: p.phone,
        email: p.email,
        course: p.course,
        medium: p.medium,
        mode: p.mode,
        amount: p.amount || p.receivable,
        paidAmount: p.paidAmount || p.collected,
        dueDate: p.dueDate ? new Date(p.dueDate) : null,
        paymentMethod: p.paymentMethod,
        transactionId: p.transactionId,
        screenshot: p.screenshot,
        status: p.status,
        createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
        approvedAt: p.approvedAt ? new Date(p.approvedAt) : null,
      },
    });
  }
  console.log(`   ✅ ${payments.length} payments migrated`);

  // 5. Expenses
  console.log("📦 Migrating expenses...");
  const expenses = readJson<any>("expenses.json");
  for (const e of expenses) {
    await prisma.expense.upsert({
      where: { id: e.id },
      update: {
        title: e.title,
        category: e.category,
        amount: e.amount,
        dueDate: e.dueDate ? new Date(e.dueDate) : new Date(),
        status: e.status,
        vendor: e.vendor,
        notes: e.notes,
        createdAt: e.createdAt ? new Date(e.createdAt) : new Date(),
      },
      create: {
        id: e.id,
        title: e.title,
        category: e.category,
        amount: e.amount,
        dueDate: e.dueDate ? new Date(e.dueDate) : new Date(),
        status: e.status,
        vendor: e.vendor,
        notes: e.notes,
        createdAt: e.createdAt ? new Date(e.createdAt) : new Date(),
      },
    });
  }
  console.log(`   ✅ ${expenses.length} expenses migrated`);

  // 6. Batches
  console.log("📦 Migrating batches...");
  const batches = readJson<any>("batches.json");
  for (const b of batches) {
    await prisma.batch.upsert({
      where: { id: b.id },
      update: {
        course: b.course,
        medium: b.medium,
        mode: b.mode,
        startDate: b.startDate ? new Date(b.startDate) : new Date(),
        seats: b.seats,
        filled: b.filled,
        duration: b.duration,
        status: b.status,
        note: b.note,
      },
      create: {
        id: b.id,
        course: b.course,
        medium: b.medium,
        mode: b.mode,
        startDate: b.startDate ? new Date(b.startDate) : new Date(),
        seats: b.seats,
        filled: b.filled,
        duration: b.duration,
        status: b.status,
        note: b.note,
      },
    });
  }
  console.log(`   ✅ ${batches.length} batches migrated`);

  // 7. Alumni
  console.log("📦 Migrating alumni...");
  const alumni = readJson<any>("alumni.json");
  for (const a of alumni) {
    await prisma.alumni.upsert({
      where: { id: a.id },
      update: {
        name: a.name,
        role: a.role,
        batch: a.batch,
        course: a.course,
        quote: a.quote,
        video: a.video,
        image: a.image,
        featured: a.featured,
        createdAt: a.createdAt ? new Date(a.createdAt) : new Date(),
      },
      create: {
        id: a.id,
        name: a.name,
        role: a.role,
        batch: a.batch,
        course: a.course,
        quote: a.quote,
        video: a.video,
        image: a.image,
        featured: a.featured,
        createdAt: a.createdAt ? new Date(a.createdAt) : new Date(),
      },
    });
  }
  console.log(`   ✅ ${alumni.length} alumni migrated`);

  // 8. Leads
  console.log("📦 Migrating leads...");
  const leads = readJson<any>("leads.json");
  for (const l of leads) {
    await prisma.lead.upsert({
      where: { id: l.id },
      update: {
        name: l.name,
        phone: l.phone,
        course: l.course,
        medium: l.medium,
        mode: l.mode,
        batchId: l.batchId,
        status: l.status,
        createdAt: l.createdAt ? new Date(l.createdAt) : new Date(),
      },
      create: {
        id: l.id,
        name: l.name,
        phone: l.phone,
        course: l.course,
        medium: l.medium,
        mode: l.mode,
        batchId: l.batchId,
        status: l.status,
        createdAt: l.createdAt ? new Date(l.createdAt) : new Date(),
      },
    });
  }
  console.log(`   ✅ ${leads.length} leads migrated`);

  // 9. Store Items
  console.log("📦 Migrating store items...");
  const storeItems = readJson<any>("store.json");
  for (const s of storeItems) {
    await prisma.storeItem.upsert({
      where: { id: s.id },
      update: {
        name: s.name,
        price: s.price,
        category: s.category,
        stock: s.stock,
        threshold: s.threshold,
        sku: s.sku,
        image: s.image,
      },
      create: {
        id: s.id,
        name: s.name,
        price: s.price,
        category: s.category,
        stock: s.stock,
        threshold: s.threshold,
        sku: s.sku,
        image: s.image,
      },
    });
  }
  console.log(`   ✅ ${storeItems.length} store items migrated`);

  // 10. Banner
  console.log("📦 Migrating banner...");
  const banner = readJson<any>("banner.json");
  if (banner && Object.keys(banner).length > 0) {
    await prisma.banner.upsert({
      where: { id: "main" },
      update: {
        enabled: banner.enabled,
        message: banner.message,
        type: banner.type,
        link: banner.link,
        updatedAt: banner.updatedAt ? new Date(banner.updatedAt) : new Date(),
      },
      create: {
        id: "main",
        enabled: banner.enabled,
        message: banner.message,
        type: banner.type,
        link: banner.link,
        updatedAt: banner.updatedAt ? new Date(banner.updatedAt) : new Date(),
      },
    });
    console.log(`   ✅ Banner migrated`);
  }

  // 11. Knowledge Chunks
  console.log("📦 Migrating knowledge chunks...");
  const knowledge = readJson<any>("knowledgeBase.json");
  if (!knowledge || knowledge.length === 0) {
    // Try fallback to knowledgeBase.ts
    try {
      const { knowledgeBase } = await import("@/data/knowledgeBase");
      for (const k of knowledgeBase) {
        await prisma.knowledgeChunk.upsert({
          where: { id: k.id },
          update: {
            category: k.category,
            keywords: k.keywords,
            en: k.en,
            hi: k.hi,
            te: k.te,
            source: k.source,
          },
          create: {
            id: k.id,
            category: k.category,
            keywords: k.keywords,
            en: k.en,
            hi: k.hi,
            te: k.te,
            source: k.source,
          },
        });
      }
      console.log(`   ✅ ${knowledgeBase.length} knowledge chunks migrated (from TS)`);
    } catch {
      console.log(`   ⚠️  No knowledge chunks found`);
    }
  } else {
    for (const k of knowledge) {
      await prisma.knowledgeChunk.upsert({
        where: { id: k.id },
        update: {
          category: k.category,
          keywords: k.keywords,
          en: k.en,
          hi: k.hi,
          te: k.te,
          source: k.source,
        },
        create: {
          id: k.id,
          category: k.category,
          keywords: k.keywords,
          en: k.en,
          hi: k.hi,
          te: k.te,
          source: k.source,
        },
      });
    }
    console.log(`   ✅ ${knowledge.length} knowledge chunks migrated`);
  }

  console.log("\n🎉 Migration complete!");
}

main()
  .catch((e) => {
    console.error("❌ Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });