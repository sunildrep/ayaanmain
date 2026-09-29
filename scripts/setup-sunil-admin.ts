import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("ERROR: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  process.exit(1);
}

const password = process.env.ADMIN_NEW_PASSWORD ?? "";
if (!password) {
  console.error("ERROR: set ADMIN_NEW_PASSWORD to the new password (never commit it)");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  const email = "sunil@drep.in";
  console.log(`Provisioning Supabase Auth for ${email} (password NOT printed)...`);

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
    update: { supabaseId, role: "super_admin", name: "Sunil Drep", username: "sunil", mustChangePassword: false },
    create: { username: "sunil", email, supabaseId, role: "super_admin", name: "Sunil Drep", mustChangePassword: false },
  });
  console.log(`Prisma admin: ${admin.username} (${admin.email}) role=${admin.role} id=${admin.id}`);

  console.log("\nDone. Verify access for sunil@drep.in using the password from ADMIN_NEW_PASSWORD.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });