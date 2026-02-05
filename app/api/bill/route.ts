import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/get-auth-user";
import { requireRole } from "@/lib/role-guard";
import type { Prisma, CartItem, Product } from "@prisma/client";

type CartItemWithProduct = CartItem & {
  product: Product;
};

export async function POST() {
  const user = await getAuthUser();
  requireRole(user.role, ["ADMIN", "STAFF"]);

  try {
    const bill = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {

        const cartItems: CartItemWithProduct[] =
          await tx.cartItem.findMany({
            where: { userId: user.userId },
            include: { product: true },
          });

        if (cartItems.length === 0) {
          throw new Error("Cart is empty");
        }

        // Stock check
        for (const item of cartItems) {
          if (item.product.stock < item.quantity) {
            throw new Error(
              `Insufficient stock for ${item.product.name}`
            );
          }
        }

        // Amount calculation
        const taxableAmount = cartItems.reduce<number>(
          (sum, item) =>
            sum + item.product.price * item.quantity,
          0
        );

        const cgst = taxableAmount * 0.09;
        const sgst = taxableAmount * 0.09;
        const igst = 0;

        const totalAmount = taxableAmount + cgst + sgst + igst;

        // ✅ THIS IS WHERE RED LINE WAS
        const bill = await tx.bill.create({
          data: {
            taxableAmount,
            cgst,
            sgst,
            igst,
            totalAmount,
            paymentMethod: "CASH",
          },
        });

        for (const item of cartItems) {
          await tx.billItem.create({
            data: {
              billId: bill.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            },
          });

          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity },
            },
          });
        }

        await tx.cartItem.deleteMany({
          where: { userId: user.userId },
        });

        return bill;
      }
    );

    return NextResponse.json(
      { message: "Bill created successfully", bill },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Bill create error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to create bill" },
      { status: 400 }
    );
  }
}
