import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/get-auth-user";
import { requireRole } from "@/lib/role-guard";

export async function POST(req: Request) {
  const user = await getAuthUser();
  requireRole(user.role, ["ADMIN"]);

  const { productId, supplier, qty, costPrice } = await req.json();

  if (!productId || !supplier || !qty || qty <= 0) {
    return NextResponse.json(
      { message: "Invalid data" },
      { status: 400 }
    );
  }

  await prisma.$transaction(async (tx) => {
    // 1️⃣ Save purchase record
    await tx.purchase.create({
      data: {
        productId,
        supplier,
        quantity: qty,
        costPrice,
        createdBy: user.userId,
      },
    });

    // 2️⃣ Increase stock
    await tx.product.update({
      where: { id: productId },
      data: {
        stock: { increment: qty },
      },
    });

    // 3️⃣ Stock log
    await tx.stockLog.create({
      data: {
        productId,
        change: qty,
        type: "PURCHASE",
        reason: `Supplier: ${supplier}`,
        createdBy: user.userId,
      },
    });
  });

  return NextResponse.json({ success: true });
}
