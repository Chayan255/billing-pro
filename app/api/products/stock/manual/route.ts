import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/get-auth-user";
import { requireRole } from "@/lib/role-guard";

export async function POST(req: Request) {
  const user = await getAuthUser();
  requireRole(user.role, ["ADMIN"]);

  const { productId, qty, reason } = await req.json();

  if (!productId || !qty || !reason?.trim()) {
    return NextResponse.json(
      { message: "Invalid data" },
      { status: 400 }
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id: productId },
      data: {
        stock: { increment: qty },
      },
    });

    await tx.stockLog.create({
      data: {
        productId,
        change: qty,
        type: "MANUAL",
        reason,
        createdBy: user.userId,
      },
    });
  });

  return NextResponse.json({ success: true });
}
