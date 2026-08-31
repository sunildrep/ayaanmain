import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const usersPath = path.join(process.cwd(), "data", "users.json");

const users = JSON.parse(fs.readFileSync(usersPath, "utf-8"));

const hashedUsers = users.map((u: any) => ({
  ...u,
  passwordHash: u.passwordHash && u.passwordHash.startsWith("$2b$") ? u.passwordHash : bcrypt.hashSync("ayaan123", 10),
}));

fs.writeFileSync(usersPath, JSON.stringify(hashedUsers, null, 2));
console.log("Users hashed and saved:", hashedUsers.length);