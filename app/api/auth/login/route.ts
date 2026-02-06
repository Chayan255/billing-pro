import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { signToken } from "@/lib/jwt";
import { verifyPassword } from "@/lib/password";


export const runtime = "nodejs";

const COOKIE_NAME = "token";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Optional verification gate
    // if (!user.isVerified) {
    //   return NextResponse.json(
    //     { message: "Account not verified" },
    //     { status: 403 }
    //   );
    // }

    const token = signToken({
      userId: user.id,
      role: user.role,
      businessType: user.businessType,
    });

    const response = NextResponse.json({
      success: true,
      role: user.role,
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
