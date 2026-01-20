import { generateToken, hashPassword } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request:NextRequest) {
  try {
    const{name,email,password, teamCode} = await request.json();
    // Validate required fields

    if(!name || !email || !password) {
   return NextResponse.json (
    {
      error: "Name, email & password are required or not valid"
    },
    {status : 400}
   );
   
    }
   // Find existing user

   const existingUser = await prisma.user.findUnique({
    where : {email},
   });
   if(existingUser){
    return NextResponse.json(
      {
        error : "User with this email address exists",
      },
      {status : 409}
    );
   }
    let teamId: string | undefined;
    if(teamCode){
      const team = await prisma.team.findUnique({
        where : {code: teamCode}
      });
      if(!team) {
        return NextResponse.json(
      {
        error : "Please enter a valid team code",
      },
      {status : 400}
    );
      }
      teamId = team.id;
    }

    const hashedPassword = await hashPassword(password);

    // First user beome ADMIN, others become USER

    const userCount = await prisma.user.count();
    const role=userCount === 0 ? Role.ADMIN : Role.USER;
     
    const user = await prisma.user.create ({
      data: {
        name,
        email,
        password: hashPassword,
        role,
        teamId,
      },
      include : {
        team : true,
      }
    });

    // Generate Token
    const token = generateToken(user.id)

    //Create response
    const response = NextResponse.json()

  } catch (error) {
    console.error("Error :",error);
  }
}