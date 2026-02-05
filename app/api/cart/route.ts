import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/get-auth-user";
import { requireRole } from "@/lib/role-guard";

/* ======================
   ADD TO CART
====================== */
export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    requireRole(user.role, ["ADMIN", "STAFF"]);

    const { productId, quantity } = await req.json();

    const pid = Number(productId);
    const qty = Number(quantity);

    if (!pid || qty <= 0) {
      return NextResponse.json(
        { message: "Invalid input" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: pid },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    const existing = await prisma.cartItem.findFirst({
      where: {
        userId: user.userId,
        productId: pid,
      },
    });

    const totalQty = (existing?.quantity ?? 0) + qty;

    if (product.stock < totalQty) {
      return NextResponse.json(
        { message: "Insufficient stock" },
        { status: 400 }
      );
    }

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: totalQty },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          userId: user.userId,
          productId: pid,
          quantity: qty,
        },
      });
    }

    const cart = await prisma.cartItem.findMany({
      where: { userId: user.userId },
      include: { product: true },
    });

    return NextResponse.json({ cart });
  } catch (error) {
    console.error("Add to cart error:", error);
    return NextResponse.json(
      { message: "Failed to add to cart" },
      { status: 500 }
    );
  }
}

/* ======================
   GET CART
====================== */
export async function GET() {
  const user = await getAuthUser();

  const cart = await prisma.cartItem.findMany({
    where: { userId: user.userId },
    include: { product: true },
  });

  return NextResponse.json({ cart });
}
