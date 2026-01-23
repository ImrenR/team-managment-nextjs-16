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
    const user = await getCurrentUser();

    if(!user || !checkPermission(user,Role.ADMIN)){
      return NextResponse.json({
        error:"Not authorized to assign the team "
      },
    {status: 401});
    }
const {teamId}= await request.json();
 if(teamId){

    const team = await prisma.team.findUnique({
      where:{id:teamId}
    });

if(!team){

  return NextResponse.json({
    status:"error",
    message:"Team not found",
  },
{status: 400}
);
}
   }
   //update users team assignment
   const updatedUser = await prisma.user.update({
    where:{id:userId},
    data:{
      teamId:teamId,
    },
    include: {
      team:true,
    },
   });
   
   return NextResponse.json({
    user:updatedUser,
    message:teamId
    ? "User assigned to team successfully" 
    : "User removed from team successfully"
   })

  } catch (error) {
    console.error("Team assignment error:",error)
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