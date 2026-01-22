import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./db";
import { Role, User } from "../types";



const JWT_SECRET= process.env.JWT_SECRET as string;

//Hashed Password
export const hashPassword = async(password:string) : Promise<string> => {
  return bcrypt.hash(password,10);
}

export const verifyPassword=async(password:string, hashPassword:string): Promise<boolean> => {
  return bcrypt.compare(password,hashPassword);
}

// Token
export const generateToken =  (userId:string) : string => { // token signed with userId
  return jwt.sign({userId},JWT_SECRET, {expiresIn:"7d"})
}

export const verifyToken = ( token:string) : { userId : string} => {
  return jwt.verify(token,JWT_SECRET) as {userId:string}
}


//currentUser

export const getCurrentUser = async() : Promise <User | null > => { // We are going to get token from cookies thats why it s async, and if you dont find the user return null
//cookies
//! whenever you need to get currentuser, get the token from cookies

const cookieStore = await cookies();
const token = cookieStore.get("token")?.value; //? get the token from cookies and call it token, if you can find the value, if you dont 
if(!token) return null;
//verify the token if you recevie it 
const decode=verifyToken(token);

const userFromdb = await prisma.user.findUnique({
  where: {id:decode.userId}
});
if(!userFromdb) return null;

const{password, ...user}=userFromdb;
return user as User;
}

//checkPErmission

export const checkPermission = (user:User, requiredRole:Role) : boolean => {
  const roleHierarchy = {
    [Role.GUEST]:0,
    [Role.USER]:1,
    [Role.MANAGER]:2,
    [Role.ADMIN]:3,
  };
  return roleHierarchy[user.role] >= roleHierarchy[requiredRole]
}