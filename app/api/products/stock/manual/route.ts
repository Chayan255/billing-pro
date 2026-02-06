import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

import { requireRole } from "@/lib/role-guard";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    requireRole(user.role, ["ADMIN"]);

    const { productId, qty, reason } = await req.json();

    if (!productId || !qty || !reason?.trim()) {
      return NextResponse.json(
        { message: "Invalid data" },
        { status: 400 }
      );
    }

    // 🔒 STEP 1: Ensure product belongs to logged-in user
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

    // 🔒 STEP 2: Transaction
    await prisma.$transaction(async (tx) => {
      // 1️⃣ Update stock
      await tx.product.update({
        where: {
          id: product.id,
          ownerId: user.id, // extra safety
        },
        data: {
          stock: {
            increment: Number(qty), // qty can be + or -
          },
        },
      });

      // 2️⃣ Stock log
      await tx.stockLog.create({
        data: {
          ownerId: user.id,
          productId: product.id,
          change: Number(qty),
          type: "MANUAL",
          reason: reason.trim(),
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Manual stock error:", error);
    return NextResponse.json(
      { message: "Manual stock update failed" },
      { status: 500 }
    );
  }
}
