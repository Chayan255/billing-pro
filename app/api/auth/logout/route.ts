import { NextResponse } from "next/server";

const COOKIE_NAME = "token";

export async function POST() {
  const res = NextResponse.json({ success: true });

  // 🔥 Force delete auth cookie
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",                       // MUST match login
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return res;
}
