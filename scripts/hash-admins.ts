import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const adminsPath = path.join(process.cwd(), "data", "admins.json");

const admins = JSON.parse(fs.readFileSync(adminsPath, "utf-8"));

const hashedAdmins = admins.map((a: any) => ({
  username: a.username,
  passwordHash: bcrypt.hashSync(a.password, 10),
  role: a.role,
  name: a.name,
}));

fs.writeFileSync(adminsPath, JSON.stringify(hashedAdmins, null, 2));
console.log("Admins hashed and saved:");
hashedAdmins.forEach((a: any) => console.log(`  ${a.username}: ${a.passwordHash}`));