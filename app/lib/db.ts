import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();


export async function checkDatabaseConnection() : Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`; // DB ping test , $queryRaw : asks to the DB if it was heard by its.
    return true;
  } catch (error) {
    console.error(`Database connection failed ${error}`);
    return false;
    
  }
}