import { generateToken, hashPassword } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { Role } from "@/app/types";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {

  try {
    // Ask client what has to enter
    const {email,name,password, teamCode}=await request.json(); // required from the client
// if client missed one of above
    if(!email || !name || !password) {
      return NextResponse.json({
        status:"error",
        message: "Name,email or password are required"
      }, 
    {status: 403}) // bad request code
    };
// if already user existed
    const existedUser= await prisma.user.findUnique({
      where:{email},
    })

    if(existedUser){
      return NextResponse.json({
        status:"error",
        message: "The user already exists"
      },
    {status: 409})
    }

    // Team control => Optional 
    let teamId: string | undefined;

   if(teamCode){

    const team = await prisma.team.findUnique({
      where:{code:teamCode}
    });

if(!team){

  return NextResponse.json({
    status:"error",
    message:"Please enter a valid team code",
  },
{status: 400}
);
}
teamId = team.id;
   }

   //hash the password first for the register and login
   const hashedPassword = await hashPassword(password);

   // First user become ADMIN, the others USER

   const userCount = await prisma.user.count();
   const role= userCount === 0 
               ? Role.ADMIN
               : Role.USER
// Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password:hashedPassword,
      teamId,
      role,
      
    },
    include: {
      team: true,
    }
  });

  // Generate Token

  const token = generateToken(user.id);

// Create response
const response = NextResponse.json({
  user:{
    id:user.id,
    email:user.email,
    name:user.name,
    role:user.role,
    teamId:user.teamId,
    team:user.team,
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
    console.error("Registration failed");
    return NextResponse.json ({
      error: "Internal server error, Something went wrong!"
    },
  {status: 500});
    
  }
  
}