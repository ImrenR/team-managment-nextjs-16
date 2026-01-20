import { checkDatabasePermission, getCurrentUser } from "@/app/lib/auth";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params;
    const currentUser = await getCurrentUser();

    if (!currentUser || !checkDatabasePermission(currentUser, Role.ADMIN)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (userId === currentUser.id) {
      return NextResponse.json({ error: "Cannot change own role" }, { status: 401 });
    }

    const { role } = await req.json();

    if (![Role.USER, Role.MANAGER].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    return NextResponse.json({ user: updatedUser, message: `Role updated to ${role}` });
  } catch (err: any) {
    console.error("Role assignment error:", err);
    if (err.message.includes("Record to update not found")) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
