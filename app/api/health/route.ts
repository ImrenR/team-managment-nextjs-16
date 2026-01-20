
import { checkDatabaseConnection } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const ok = await checkDatabaseConnection();
  return NextResponse.json(
    {
      status: ok ? "ok" : "error",
      message: ok
        ? "Database connection successful"
        : "Database connection failed",
    },
    { status: ok ? 200 : 503 }
  );
}
