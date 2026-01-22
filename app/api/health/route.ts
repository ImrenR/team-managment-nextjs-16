import { checkDatabaseConnection } from "@/app/lib/db";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";



export const prisma = new PrismaClient();


export async function GET() {

  const isConnected = await checkDatabaseConnection();

  if(!isConnected){

    return NextResponse.json({
      status:"error",
      message:"Database connection has failed",
    },
  {status:503});
  }
  return NextResponse.json({
      status:"ok",
      message:"Database connected successfully",
    },
  {status: 200});
}