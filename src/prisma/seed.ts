import { prisma } from "../config/prisma";
import bcrypt from "bcrypt";

async function main() {
  // পাসওয়ার্ড এনক্রিপশন
  const superAdminPass = await bcrypt.hash("superadmin29@", 10);
  const adminPass = await bcrypt.hash("snera29@", 10);
  const userPass = await bcrypt.hash("user29@", 10);

  // ১. SUPER_ADMIN
  await prisma.user.upsert({
    where: { email: "superadmin@medi.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "superadmin@medi.com",
      password: superAdminPass,
      role: "SUPER_ADMIN",
      isBanned: false,
    },
  });

  // ২. ADMIN (আপনার দেওয়া তথ্য অনুযায়ী)
  await prisma.user.upsert({
    where: { email: "snearaparvin.cse1@gmail.com" },
    update: {},
    create: {
      name: "sneara",
      email: "snearaparvin.cse1@gmail.com",
      password: adminPass,
      role: "ADMIN",
      isBanned: false,
    },
  });

  // ৩. REGULAR USER
  await prisma.user.upsert({
    where: { email: "user@gmail.com" },
    update: {},
    create: {
      name: "Regular User",
      email: "user@gmail.com",
      password: userPass,
      role: "CUSTOMER",
      isBanned: false,
    },
  });
}

main()
  .catch(console.error)
  .finally(async () => await prisma.$disconnect());