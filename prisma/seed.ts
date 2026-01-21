import { hashPassword } from "@/app/lib/auth";
import { PrismaClient, Role } from "@prisma/client";


const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  // Takımları sil ve yeniden oluştur
  await prisma.user.deleteMany({});
  await prisma.team.deleteMany({});

  const engineering = await prisma.team.create({
    data: { name: "Engineering", description: "Software dev team", code: "ENG-2025" },
  });

  const marketing = await prisma.team.create({
    data: { name: "Marketing", description: "Marketing team", code: "MKT-2025" },
  });

  const operations = await prisma.team.create({
    data: { name: "Operations", description: "Operations team", code: "OPS-2025" },
  });

  // Admin kullanıcı
  await prisma.user.create({
    data: {
      email: "imrenrahbay@gmail.com",
      name: "Imren Rahbay",
      password: await hashPassword("123456"), // Bu şifre ile login edeceğiz
      role: Role.ADMIN,
    },
  });

  // Örnek kullanıcılar
  await prisma.user.create({
    data: {
      email: "john@company.com",
      name: "John Developer",
      password: await hashPassword("123456"),
      role: Role.MANAGER,
      teamId: engineering.id,
    },
  });

  await prisma.user.create({
    data: {
      email: "jane@company.com",
      name: "Jane Developer",
      password: await hashPassword("123456"),
      role: Role.USER,
      teamId: engineering.id,
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
