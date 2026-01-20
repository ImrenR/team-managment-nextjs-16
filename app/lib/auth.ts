// app/lib/auth.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./db"; // make sure this path is correct
import { User } from "../types";
import { Role } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET!;

// Password hashing
export const hashPassword = (password: string) => bcrypt.hash(password, 12);
export const verifyPassword = (password: string, hash: string) =>
  bcrypt.compare(password, hash);

// JWT
export const generateToken = (userId: string) =>
  jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
export const verifyToken = (token: string) =>
  jwt.verify(token, JWT_SECRET) as { userId: string };

// Current user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { team: { include: { members: true } } },
    });

    if (!user) return null;

    const { password, ...rest } = user;
    return rest as User;
  } catch (err) {
    console.error("Error in getCurrentUser:", err);
    return null;
  }
};

// Role check
export const checkDatabasePermission = (
  user: User,
  requiredRole: Role,
): boolean => {
  const roleHierarchy = {
    [Role.GUEST]: 0,
    [Role.USER]: 1,
    [Role.MANAGER]: 2,
    [Role.ADMIN]: 3,
  };
  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
};
