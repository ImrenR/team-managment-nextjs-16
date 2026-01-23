import { generateToken, verifyPassword } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {

  try {
    // Ask client what has to enter
    const {email,password}=await request.json(); // required from the client
// if client missed one of above
    if(!email || !password) {
      return NextResponse.json({
        status:"error",
        message: "email or password are required"
      }, 
    {status: 403}) // bad request code
    };

    const userFromDb= await prisma.user.findUnique({
      where:{email},
      include:{team: true},
    })

  if(!userFromDb){
    return NextResponse.json({
      error:"Invalid credentails"
    },{status: 401}
  );
  }
   //hash the password first for the register and login
   const isValidPassword = await verifyPassword(password,userFromDb.password);
if(!isValidPassword){
    return NextResponse.json({
      error:"Invalid credentails"
    },{status: 401}
  );
  }
   

  // Generate Token

  const token = generateToken(userFromDb.id);

// Create response
const response = NextResponse.json({
  user:{
    id:userFromDb.id,
    email:userFromDb.email,
    name:userFromDb.name,
    role:userFromDb.role,
    teamId:userFromDb.teamId,
    team:userFromDb.team,
    token // those part will be appear on body when we hit the post
  }
});

//set cookies => whenever we logedin or register we have to set cookies

response.cookies.set("token",token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite:"lax",
  maxAge:60*60*24*7,
});
  return response;
  } catch (error) {
    console.error("Login failed");
    return NextResponse.json ({
      error: "Internal server error, Something went wrong!"
    },
  {status: 500});
    
  }
  
}