import { PrismaClient } from "@prisma/client";
import { courseDetails } from "../data/courseDetails";
import { FALLBACK_FEE } from "../lib/fees";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding courses, syllabus, branches, fees...\n");

  // Branches
  const branches = [
    { name: "Warangal", address: "Don Bosco School, Opp. Vaagdevi College, Bollikunta, Warangal 506005", phone: "+91 88866 67222" },
    { name: "Hanamkonda", address: "2nd Floor, Mayuri Mall, Kishanpura, Hanamkonda, Warangal 506001", phone: "+91 88866 67222" },
    { name: "Hyderabad", address: "Chenna Complex, Pillar 1542, Dilsukhnagar, Hyderabad", phone: "+91 88866 67222" },
    { name: "Bollikunta (Residential)", address: "15 Acres Campus, Bollikunta, Warangal", phone: "+91 88866 67222" },
  ];
  for (const b of branches) {
    await prisma.branch.upsert({
      where: { name: b.name },
      update: { address: b.address, phone: b.phone },
      create: b,
    });
  }
  console.log(`✅ ${branches.length} branches seeded`);

  // FeeConfigs - fallback defaults (centralized in lib/fees.ts)
  let feeCount = 0;
  for (const course of Object.keys(FALLBACK_FEE)) {
    for (const mode of Object.keys(FALLBACK_FEE[course])) {
      await prisma.feeConfig.upsert({
        where: { course_mode_duration_medium_branch: { course, mode, duration: "", medium: "", branch: "" } },
        update: { amount: FALLBACK_FEE[course][mode] },
        create: { course, mode, duration: "", medium: "", branch: "", amount: FALLBACK_FEE[course][mode] },
      });
      feeCount++;
    }
  }
  console.log(`✅ ${feeCount} fee configs seeded`);

  // Courses + Syllabus
  for (const c of courseDetails) {
    const course = await prisma.course.upsert({
      where: { slug: c.slug },
      update: {
        title: c.title,
        tag: c.tag,
        desc: c.desc,
        duration: c.duration,
        fee: c.fee,
        eligibility: c.eligibility,
        ageLimit: c.ageLimit,
        notificationDate: c.notificationDate,
        prerequisites: c.prerequisites,
        highlights: c.highlights,
        mediums: c.medium,
        modes: c.mode,
      },
      create: {
        slug: c.slug,
        title: c.title,
        tag: c.tag,
        desc: c.desc,
        duration: c.duration,
        fee: c.fee,
        eligibility: c.eligibility,
        ageLimit: c.ageLimit,
        notificationDate: c.notificationDate,
        prerequisites: c.prerequisites,
        highlights: c.highlights,
        mediums: c.medium,
        modes: c.mode,
      },
    });

    // Clear existing syllabus and recreate
    await prisma.syllabusItem.deleteMany({ where: { courseId: course.id } });
    for (const s of c.syllabus) {
      await prisma.syllabusItem.create({
        data: {
          courseId: course.id,
          subject: s.subject,
          topics: s.topics,
        },
      });
    }
    console.log(`✅ Course ${c.slug} + ${c.syllabus.length} syllabus items`);
  }

  console.log("\n🎉 All seeds complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
