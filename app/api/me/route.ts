import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getAuthUser(); // 👈 Prisma User

    const data = await prisma.user.findUnique({
      where: { id: user.id }, // ✅ FIXED
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        businessType: true,
      },
    });

    if (!data) {
      return NextResponse.json(
        { message: "Session expired" },
        { status: 401 }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }
}
