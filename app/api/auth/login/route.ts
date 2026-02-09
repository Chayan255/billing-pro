import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { signToken } from "@/lib/jwt";
import { verifyPassword } from "@/lib/password";

export const runtime = "nodejs";

const COOKIE_NAME = "token";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // 🔹 Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password required" },
        { status: 400 }
      );
    }

    // 🔹 Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 🔹 Verify password
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 🔹 Sign JWT
    const token = signToken({
      userId: user.id,
      role: user.role,
      businessType: user.businessType,
    });

    // 🔹 Success response
    const response = NextResponse.json({
      success: true,
      role: user.role,
    });

    // 🔥 CRITICAL: COOKIE MUST MATCH LOGOUT + MIDDLEWARE
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      path: "/",                       // 🔥 MUST
      sameSite: "lax",                 // 🔥 MUST
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,            // 1 day
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    // 🔹 Safety: never leave stale cookie on error
    const res = NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );

    res.cookies.set(COOKIE_NAME, "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    });

    return res;
  }
}
