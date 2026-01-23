import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({
    message: " The user has been logged out"
  }, {
    status:200
  });

response.cookies.set("token","",{
  httpOnly:true,
  secure:process.env.NODE_ENV === "production",
  sameSite:"lax",
  maxAge:0,
});
return response;
}



