import { getCurrentUser } from "@/app/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request:NextRequest) {
  try {
    const user= await getCurrentUser();

    if(!user){
      return NextResponse.json({
        error: "Ypu are not authorized to access user information"
      },{
        status: 401
      }
    );
    }

    const searchParams = request.nextUrl.searchParams;
  } catch (error) {
    
  }
  
}