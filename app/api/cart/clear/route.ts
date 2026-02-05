import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/get-auth-user";

export async function POST() {
  const user = await getAuthUser();

  await prisma.cartItem.deleteMany({
    where: { userId: user.userId },
  });

  return NextResponse.json({
    message: "Cart cleared",
  });
}
