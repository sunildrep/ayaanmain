import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

const adminPassword = process.env.ADMIN_NEW_PASSWORD ?? "";
const studentPassword = process.env.STUDENT_NEW_PASSWORD ?? "";
if (!adminPassword || !studentPassword) {
  console.error("ERROR: set ADMIN_NEW_PASSWORD and STUDENT_NEW_PASSWORD (never commit them)");
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
    console.log(`   ${email} already exists in Supabase Auth (${existing.id})`);
    // Update password and metadata
    const { error } = await supabaseAdmin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: metadata,
    });
    if (error) console.error(`   Failed to update ${email}:`, error.message);
    else console.log(`   Updated ${email}`);
    return existing.id;
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  });
  if (error) {
    console.error(`   Failed to create ${email}:`, error.message);
    return null;
  }
  console.log(`   Created ${email} (${data.user.id})`);
  return data.user.id;
}

function strongPassword(prefix: string) {
  return `${prefix}${crypto.randomBytes(6).toString("base64url")}`;
}

async function main() {
  console.log("Setting up Supabase Auth for all users (passwords NOT printed)...\n");

  // 1. Admins
  console.log("Provisioning Supabase Auth for admins...");
  const admins = await prisma.admin.findMany({ orderBy: { username: "asc" } });
  for (const a of admins) {
    const email = a.email;
    if (!email) continue;
    const supabaseId = await createSupabaseUser(email, adminPassword, {
      username: a.username,
      role: a.role,
      name: a.name,
    });
    if (supabaseId) {
      await prisma.admin.update({
        where: { username: a.username },
        data: { supabaseId, email },
      });
      console.log(`   Linked prisma admin ${a.username} -> ${supabaseId}`);
    }
  }

  // 2. Users (students)
  console.log("\nProvisioning Supabase Auth for students...");
  const users = await prisma.user.findMany();
  for (const u of users) {
    if (!u.email) continue;
    const password = studentPassword || strongPassword("Ayaan_");
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
      console.log(`   Linked prisma user ${u.email} -> ${supabaseId}`);
    }
  }

  console.log("\nSupabase Auth setup complete!");
  console.log("Passwords come from ADMIN_NEW_PASSWORD / STUDENT_NEW_PASSWORD env vars - rotate in the Supabase dashboard.");
}

main()
  .catch((e) => {
    console.error("Setup failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });