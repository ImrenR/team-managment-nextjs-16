import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./db";

const JWT_SECRET = process.env.JWT_SECRET!;

export const hashPassword = (password: string) => bcrypt.hash(password, 12);
export const verifyPassword = (password: string, hash: string) =>
  bcrypt.compare(password, hash);

export const generateToken = (userId: string) =>
  jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });

export const verifyToken = (token: string) =>
  jwt.verify(token, JWT_SECRET) as { userId: string };

export const getCurrentUser = async () => {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { team: true },
    });
    if (!user) return null;
    const { password, ...rest } = user;
    return rest;
  } catch (err) {
    console.error("getCurrentUser error:", err);
    return null;
  }
};
