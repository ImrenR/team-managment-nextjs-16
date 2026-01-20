import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, checkDatabasePermission } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { Role } from "@prisma/client";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> } // params artık Promise
) {
  try {
    // await ile params'i çöz
    const resolvedParams = await params;
    const { userId } = resolvedParams;

    const currentUser = await getCurrentUser();

    // Admin kontrolü
    if (!currentUser || !checkDatabasePermission(currentUser, Role.ADMIN)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Kendi rolünü değiştirmeye çalışmasın
    if (userId === currentUser.id) {
      return NextResponse.json({ error: "Cannot change own role" }, { status: 401 });
    }

    const { role } = await req.json();

    // Sadece USER veya MANAGER rolü verilebilir
    if (![Role.USER, Role.MANAGER].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Rol güncelle
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    return NextResponse.json({
      user: updatedUser,
      message: `Role updated to ${role}`,
    });
  } catch (err: any) {
    console.error("Role assignment error:", err);
    if (err.message.includes("Record to update not found")) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
