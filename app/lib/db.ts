import { PrismaClient } from "@prisma/client";

declare global {
  // Hot reload sırasında birden fazla PrismaClient oluşmasını önlemek için
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["query"], // opsiyonel
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
