import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  let user;

  try {
    user = await getAuthUser();
  } catch {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const data = await prisma.user.findUnique({
    where: { id: user.id },
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

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store", // 🔥 IMPORTANT
    },
  });
}
