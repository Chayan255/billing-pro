import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function POST() {
  const user = await getAuthUser();

  await prisma.cartItem.deleteMany({
    where: {
      ownerId: user.id, // ✅ OWNER SAFE
    },
  });

  return NextResponse.json({
    message: "Cart cleared",
  });
}
