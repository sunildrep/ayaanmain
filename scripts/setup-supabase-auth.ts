import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function createSupabaseUser(email: string, password: string, metadata: any) {
  // Try to create, if exists, update
  const { data: list } = await supabaseAdmin.auth.admin.listUsers();
  const existing = list?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (existing) {
    console.log(`   ℹ️  ${email} already exists in Supabase Auth (${existing.id})`);
    // Update password and metadata
    const { error } = await supabaseAdmin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: metadata,
    });
    if (error) console.error(`   ❌ Failed to update ${email}:`, error.message);
    else console.log(`   🔄 Updated ${email}`);
    return existing.id;
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  });
  if (error) {
    console.error(`   ❌ Failed to create ${email}:`, error.message);
    return null;
  }
  console.log(`   ✅ Created ${email} (${data.user.id})`);
  return data.user.id;
}

async function main() {
  console.log("🔐 Setting up Supabase Auth for all users...\n");

  // 1. Admins
  console.log("📦 Creating Supabase Auth for admins...");
  const admins = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "admins.json"), "utf-8"));
  const adminPasswords: Record<string, string> = {
    admin: "Ayaan@2026",
    finance: "Finance@2026",
    admissions: "Admissions@2026",
  };
  for (const a of admins) {
    const email = a.email;
    const password = adminPasswords[a.username] || "Ayaan@2026";
    const supabaseId = await createSupabaseUser(email, password, {
      username: a.username,
      role: a.role,
      name: a.name,
    });
    if (supabaseId) {
      await prisma.admin.update({
        where: { username: a.username },
        data: { supabaseId, email },
      });
      console.log(`   🔗 Linked prisma admin ${a.username} -> ${supabaseId}`);
    }
  }

  // 2. Users (students)
  console.log("\n📦 Creating Supabase Auth for students...");
  const users = await prisma.user.findMany();
  // For existing users, we don't know their plaintext passwords (only bcrypt hash)
  // We'll set a temporary password and they can reset via Supabase password reset
  // For the migrated user, we know it's "ayaan123" from earlier hash-users script
  const knownPasswords: Record<string, string> = {
    "sunilsainath007@gmail.com": "ayaan123",
  };
  for (const u of users) {
    const password = knownPasswords[u.email.toLowerCase()] || `Ayaan@${u.phone.slice(-4)}` || "Ayaan@123";
    const supabaseId = await createSupabaseUser(u.email, password, {
      name: u.name,
      phone: u.phone,
      course: u.course,
    });
    if (supabaseId) {
      await prisma.user.update({
        where: { id: u.id },
        data: { supabaseId },
      });
      console.log(`   🔗 Linked prisma user ${u.email} -> ${supabaseId}`);
    }
  }

  console.log("\n🎉 Supabase Auth setup complete!");
  console.log("\n📌 Admin logins (now via Supabase Auth):");
  console.log("   admin@ayaaninstitute.in / Ayaan@2026 (super_admin)");
  console.log("   finance@ayaaninstitute.in / Finance@2026 (finance)");
  console.log("   admissions@ayaaninstitute.in / Admissions@2026 (admissions)");
  console.log("\n📌 Student logins use email + password via Supabase Auth");
  console.log("   Example: sunilsainath007@gmail.com / ayaan123");
}

main()
  .catch((e) => {
    console.error("❌ Setup failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
