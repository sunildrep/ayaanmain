import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  const email = "sunil@drep.in";
  const password = "Sunil@Drep2024"; // temp, will be OTP-based
  console.log(`Creating Supabase Auth for ${email}...`);

  const { data: list } = await supabaseAdmin.auth.admin.listUsers();
  const existing = list?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  let supabaseId: string | null = null;

  if (existing) {
    console.log(`Already exists: ${existing.id}`);
    supabaseId = existing.id;
    const { error } = await supabaseAdmin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: { name: "Sunil Drep", role: "super_admin", username: "sunil" },
    });
    if (error) console.error("Update error:", error.message);
    else console.log("Updated password and metadata");
  } else {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: "Sunil Drep", role: "super_admin", username: "sunil" },
    });
    if (error) {
      console.error("Create error:", error.message);
      process.exit(1);
    }
    supabaseId = data.user.id;
    console.log(`Created ${email} -> ${supabaseId}`);
  }

  // Upsert Prisma admin
  const admin = await prisma.admin.upsert({
    where: { email },
    update: { supabaseId, role: "super_admin", name: "Sunil Drep", username: "sunil" },
    create: { username: "sunil", email, supabaseId, role: "super_admin", name: "Sunil Drep" },
  });
  console.log(`Prisma admin: ${admin.username} (${admin.email}) role=${admin.role} id=${admin.id}`);

  console.log("\nDone. Login via OTP will work for sunil@drep.in");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
