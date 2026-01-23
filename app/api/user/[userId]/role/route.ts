import { checkPermission, getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { Role } from "@/app/types";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request:NextRequest,
  context: {params : Promise<{userId:string}>}
) {
  try {
    const {userId} = await context.params;
    const currentUser = await getCurrentUser();

    if(!currentUser || !checkPermission(currentUser,Role.ADMIN)){
      return NextResponse.json({
        error:"Not authorized to assign the team "
      },
    {status: 401});
    }

    //Prevent users from changing their own role 
if(userId === currentUser.id) {
  return NextResponse.json({
        error:"You can not change the role "
      },
    {status: 401});
}

const {role}= await request.json();

const validateRoles = [Role.USER, Role.MANAGER];
 

if(!validateRoles.includes(role)){

  return NextResponse.json({
    status:"error",
    message:"Invalid role or you cant have more than one Admin role user",
  },
{status: 400}
);
}

   //update users team assignment
   const updatedUser = await prisma.user.update({
    where:{id:userId},
    data:{
      role,
    },
    include: {
      team:true,
    },
   });
   
   return NextResponse.json({
    user:updatedUser,
    message: `User role updated to ${role} successfully`
   })

  } catch (error) {
    console.error("Role assignment error:",error)
    if(error instanceof Error && error.message.includes("Record to update not found ")){
      return NextResponse.json({
        error: "User not found",
      }, {status:404});
    }
  return NextResponse.json({
        error: "Internal server error,Something went wrong",
      }, {status:404});
    }
}