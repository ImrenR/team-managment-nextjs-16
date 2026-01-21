import { checkDatabaseConnection } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET() {

  const isConnected = await checkDatabaseConnection();
  
  if(!isConnected){ // if DB is not asnwers

    return NextResponse.json( // Answer to the client with JSON
      {
        status:"error",
        message:"Database connection failed",
      },
      {
        status:503
      }
    );
  }

  return NextResponse.json({
    status:"ok",
    message: "Database connected successfully",
  },{
    status: 200
  });
  
}