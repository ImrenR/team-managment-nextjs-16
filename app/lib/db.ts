// app/lib/db.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // Hot reload sırasında yeni PrismaClient oluşturmayı önlemek için
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma || new PrismaClient({
    log: ["query"], // opsiyonel, SQL sorgularını görmek için
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

// Database helper
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database connection failed", error);
    return false;
  }
}
