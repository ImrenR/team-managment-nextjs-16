import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import {prisma} from "./db";
import { Role, User } from "../types";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

export const verifyPassword = async (
  password: string,
  hashPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hashPassword);
};

//!Mantık: Login sonrası client’a JWT gönderilir 
// → auth header veya cookie’de saklanır
export const generateToken = (userId: string): string => {
  return jwt.sign({userId}, JWT_SECRET, {expiresIn: "7d"});
};

export const verifyToken = (token: string): {userId : string} => {
  return jwt.verify(token, JWT_SECRET) as {userId:string};
};

export const getCurrentUser=async(): Promise<User | null> => {
try {
  const cookieStore = await cookies(); //Next server tarafinda cookielar alir
  const token = cookieStore.get("token")?.value; // token yoksa null don
  if(!token) return null;

  const decode = verifyToken(token); // token decode edilir

  const userFromDb = await prisma.user.findUnique({ //Db den kullaniciyi cek
    where : {id: decode.userId},
  });
  if(!userFromDb) return null; //Kullanici DB de yoksa null
  const{password, ...user} = userFromDb; // passwordu geri donme
  return user as User;
} catch (error) {
  console.error("Error",error);
  return null;
}
};

export const checkUserPermission= (
  user: User,
  requiredRole:Role

): boolean => {
  const roleHoerarchy = {
    [Role.GUEST]:0,
    [Role.USER]:1,
    [Role.MANAGER]:2,
    [Role.ADMIN]:3,
  };
  return roleHoerarchy[user.role] >= roleHoerarchy[requiredRole];
}
