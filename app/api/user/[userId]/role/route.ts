import { getCurrentUser } from "@/app/lib/auth";
import { Role } from "@/app/types";
import { NextRequest, NextResponse } from "next/server";
import {  prisma } from "@/app/lib/db";


export async function PATCH(
  request: NextRequest,
  context :{params: Promise<{userId : string}>}
) {
  try {
    const { userId}= await context.params;
    const currentUser = await getCurrentUser();

    if(!currentUser|| currentUser.role !== Role.ADMIN){
      return NextResponse.json(
        {
            error: "you are not authorized to assign team",
      },
    {status : 401}
  );
    }

// Prevent users from changing their own role
if(userId === currentUser.id){
   return NextResponse.json(
        {
            error: "you can not changed your own role",
      },
    {status : 401}
  );
}

const {role} =await request.json();

// Validate role
const validateRole =[Role.USER,Role.MANAGER];

      if(!validateRole.includes(role)){
        return NextResponse.json(
          {
            error: "Invalid role or you cannot have more than one Admin role user",
          },
          {status: 404}
        );
      }

    //Update users team assignment
    const updateUser = await prisma.user.update({
      where: {id:userId},
      data: {
        role,
      },
      include: {
        team:true,
      }
    });
      return NextResponse.json({
        user:updateUser,
        message:`User role update to ${role} successfully`,
      })
  } catch (error) {
    console.error("Role assignment error:" , error);
    if(error instanceof Error 
      && error.message.includes("Record to update not found"))
      
      return NextResponse.json({
        error: "User not found",
      },
    {status:404}
  );
  }
    return NextResponse.json({
        error: "Internal server error, Something went wrong",
      },
    {status:500}
  );
}



