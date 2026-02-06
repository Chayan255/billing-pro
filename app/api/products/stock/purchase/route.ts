import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

import { requireRole } from "@/lib/role-guard";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    requireRole(user.role, ["ADMIN"]);

    const { productId, supplier, qty, costPrice } =
      await req.json();

    if (!productId || !supplier || !qty || qty <= 0) {
      return NextResponse.json(
        { message: "Invalid data" },
        { status: 400 }
      );
    }

    // 🔒 STEP 1: Ensure product belongs to THIS user
    const product = await prisma.product.findFirst({
      where: {
        id: Number(productId),
        ownerId: user.id,
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // 🔒 STEP 2: Transaction (atomic)
    await prisma.$transaction(async (tx) => {
      // 1️⃣ Save purchase
      await tx.purchase.create({
        data: {
          ownerId: user.id,
          productId: product.id,
          supplier,
          quantity: Number(qty),
          costPrice: costPrice
            ? Number(costPrice)
            : null,
        },
      });

      // 2️⃣ Update stock
      await tx.product.update({
        where: {
          id: product.id,
          ownerId: user.id, // 🔒 double safety
        },
        data: {
          stock: {
            increment: Number(qty),
          },
        },
      });

      // 3️⃣ Stock log
      await tx.stockLog.create({
        data: {
          ownerId: user.id,
          productId: product.id,
          change: Number(qty),
          type: "PURCHASE",
          reason: `Supplier: ${supplier}`,
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Purchase error:", error);
    return NextResponse.json(
      { message: "Purchase failed" },
      { status: 500 }
    );
  }
}
