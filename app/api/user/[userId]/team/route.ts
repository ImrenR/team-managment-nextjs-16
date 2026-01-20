import { checkDatabasePermission, getCurrentUser } from "@/app/lib/auth";
import { Role } from "@/app/types";
import { NextRequest, NextResponse } from "next/server";
import {  prisma } from "@/app/lib/db";
export async function PATCH(
  request: NextRequest,
  context :{params: Promise<{userId : string}>}
) {
  try {
    const { userId}= await context.params;
    const user = await getCurrentUser();

    if(!user || !checkDatabasePermission(user, Role.ADMIN)){
      return NextResponse.json(
        {
            error: "you are not authorized to assign team",
      },
    {status : 401}
  );
    }
    const {teamId}=await request.json();
    if(teamId){
      const team = await prisma.team.findUnique({
        where: {id:teamId},
      });
      if(!team){
        return NextResponse.json(
          {
            error: "Team not found",
          },
          {status: 404}
        );
      }
    }

    //Update users team assignment
    const updateUser = await prisma.user.update({
      where: {id:userId},
      data: {
        teamId:teamId,
      },
      include: {
        team:true,
      }
    });
      return NextResponse.json({
        user:updateUser,
        message: teamId
        ? "User assigned to team successfully"
        : "User removed from team successfully"
      })
  } catch (error) {
    console.error("Team assignment error:" , error);
    if(error instanceof Error && error.message.includes("Record to update not found"))
      
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



