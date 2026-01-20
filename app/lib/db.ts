import { PrismaClient } from "@prisma/client/extension";


export const prisma = new PrismaClient();

//Database helper function

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`Select 1`;
    return true;
  } catch (error) {
    console.error(`Database connection failed`);
    return false;
  }
}