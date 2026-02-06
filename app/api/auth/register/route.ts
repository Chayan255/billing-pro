import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const {
      name,
      email,
      password,
      businessType,
      businessName,
    } = await req.json();

    // ✅ Validation
    if (
      !name ||
      !email ||
      !password ||
      !businessType ||
      !businessName
    ) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "MEDICINE",
      "GROCERY",
      "SHOPPING_MALL",
      "GARMENTS",
    ];

    if (!allowedTypes.includes(businessType)) {
      return NextResponse.json(
        { message: "Invalid business type" },
        { status: 400 }
      );
    }

    // ✅ Email unique check
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 409 }
      );
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create user
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
        businessType,
        businessName,
        isVerified: true,
      },
    });

    return NextResponse.json(
      { message: "Account created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { message: "Registration failed" },
      { status: 500 }
    );
  }
}
