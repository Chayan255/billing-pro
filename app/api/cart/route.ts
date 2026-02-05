import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/get-auth-user";
import { requireRole } from "@/lib/role-guard";

export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    requireRole(user.role, ["ADMIN", "STAFF"]);

    const body = await req.json();

    const productId = Number(body.productId);
    const quantity =
      body.quantity !== undefined
        ? Number(body.quantity)
        : undefined;

    const discount =
      body.discount !== undefined
        ? Number(body.discount)
        : undefined;

    if (!productId) {
      return NextResponse.json(
        { message: "Invalid product" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
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
        productId,
      },
    });

    /* ======================
       REMOVE ITEM
    ====================== */
    if (quantity === 0 && existing) {
      await prisma.cartItem.delete({
        where: { id: existing.id },
      });
    }

    /* ======================
       CREATE
    ====================== */
    if (!existing && quantity !== undefined && quantity > 0) {
      if (quantity > product.stock) {
        return NextResponse.json(
          { message: "Insufficient stock" },
          { status: 400 }
        );
      }

      await prisma.cartItem.create({
        data: {
          userId: user.userId,
          productId,
          quantity,
          price: product.price,
          discount: discount ?? 0,
          discountType: "FLAT",
          gstPercent: 18,
        },
      });
    }

    /* ======================
       UPDATE
    ====================== */
    if (existing) {
      const updateData: any = {};

      // ✅ qty only if provided
      if (quantity !== undefined && quantity > 0) {
        if (quantity > product.stock) {
          return NextResponse.json(
            { message: "Insufficient stock" },
            { status: 400 }
          );
        }
        updateData.quantity = quantity;
      }

      // ✅ discount only if provided
      if (discount !== undefined) {
        updateData.discount = discount;
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.cartItem.update({
          where: { id: existing.id },
          data: updateData,
        });
      }
    }

    const cart = await prisma.cartItem.findMany({
      where: { userId: user.userId },
      include: { product: true },
    });

    return NextResponse.json({ cart });
  } catch (error) {
    console.error("Cart error:", error);
    return NextResponse.json(
      { message: "Failed to update cart" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const user = await getAuthUser();

  const cart = await prisma.cartItem.findMany({
    where: { userId: user.userId },
    include: { product: true },
  });

  return NextResponse.json({ cart });
}
