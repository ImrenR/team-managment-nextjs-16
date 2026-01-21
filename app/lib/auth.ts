import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import {prisma} from "./db";
import { Role, User } from "../types";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
}; 
// The password is hashed here (one-way hashing for security)
// bcrypt.hash is a function from the bcrypt library
// It converts the plain text password into a secure hash
// 4=> very weak 10=> good 12=>so strong

export const verifyPassword = async (
  password: string,
  hashPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hashPassword);
};//returns boolean
// when users enters their pass in string, bcrypt compares the hash with password
// hash = locker


export const generateToken = (userId: string): string => {
  return jwt.sign({userId}, JWT_SECRET, {expiresIn: "7d"});
};                //payload //imza anahtari //suresi
// payload:the info we input inside the token (Bu userId ye sahip kullanici giris yapti)
// Logic: After login, a JWT is sent to the client
// It is stored in the auth header or in a cookie


export const verifyToken = (token: string): {userId : string} => {
  return jwt.verify(token, JWT_SECRET) as {userId:string};
};

export const getCurrentUser=async(): Promise<User | null> => {
try {
  const cookieStore = await cookies(); //Next server tarafinda cookielar alir
  
  const token = cookieStore.get("token")?.value; // token yoksa null don
  
  if(!token) return null;

  const decode = verifyToken(token); // token gercek mi? icinden userId al
//Bu fonksiyon sunu doner : {userId:"abc123"}
  const userFromDb = await prisma.user.findUnique({ //Db den kullaniciyi cek
    
    where : {id: decode.userId}, //where Prisma API nin kurali
  // bir kayit ariyorsan bana where ile soyle
  //“id’si token’dan çıkan userId olan user’ı bul”
  });
  if(!userFromDb) return null; //Kullanici DB de yoksa null

  const{password, ...user} = userFromDb; // passwordu geri donme
  // password haric her seyi geri dondur, password client e gitmez engellenir
  return user as User; // bu obje benim user interface imle uyumludur
} 
catch (error) {
  console.error("Error",error);
  return null;
}
};

export const checkUserPermission= (
  user: User,
  requiredRole:Role
// bu kullanici bu islemi yapmaya yetkili mi
// kullanici login yapmis olabilir ama yetkiye sahip degil
): boolean => {
  const roleHoerarchy = { // her role e bir seviye verdik
    [Role.GUEST]:0,
    [Role.USER]:1,
    [Role.MANAGER]:2,
    [Role.ADMIN]:3,//buyuk sayi daha yuksek yetki
  };
  return roleHoerarchy[user.role] >= roleHoerarchy[requiredRole];
}// ts kodudur ,// bu kullanicinin rolu.   //bu route i sadece manager ve ustu kullanabilir
// requiredRole: Role e atandi min yetki seviyesi belli en az user oalbilir
// user.role = Role.USER = 1
// requiredRole = Role.MANAGER = 2
// 1>= 2 => false => kullanici yetkisiz