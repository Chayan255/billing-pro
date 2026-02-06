import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

import { requireRole } from "@/lib/role-guard";
import { getAuthUser } from "@/lib/auth";

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

    /* ======================
       LOAD PRODUCT (OWNER SAFE)
    ====================== */
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        ownerId: user.id,
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    /* ======================
       LOAD CART ITEM (OWNER SAFE)
    ====================== */
    const existing = await prisma.cartItem.findFirst({
      where: {
        ownerId: user.id,
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
       CREATE ITEM
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
          ownerId: user.id,
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
       UPDATE ITEM
    ====================== */
    if (existing) {
      const updateData: any = {};

      if (quantity !== undefined && quantity > 0) {
        if (quantity > product.stock) {
          return NextResponse.json(
            { message: "Insufficient stock" },
            { status: 400 }
          );
        }
        updateData.quantity = quantity;
      }

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

    /* ======================
       RETURN UPDATED CART
    ====================== */
    const cart = await prisma.cartItem.findMany({
      where: {
        ownerId: user.id,
      },
      include: {
        product: true,
      },
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

/* ======================
   GET CART (OWNER SAFE)
====================== */
export async function GET() {
  const user = await getAuthUser();

  const cart = await prisma.cartItem.findMany({
    where: {
      ownerId: user.id,
    },
    include: {
      product: true,
    },
  });

  return NextResponse.json({ cart });
}
