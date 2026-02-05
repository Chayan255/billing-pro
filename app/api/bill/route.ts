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
        // 1️⃣ Get cart items with product
        const cartItems: CartItemWithProduct[] =
          await tx.cartItem.findMany({
            where: { userId: user.userId },
            include: { product: true },
          });

        if (cartItems.length === 0) {
          throw new Error("Cart is empty");
        }

        // 2️⃣ Re-check stock
        for (const item of cartItems) {
          if (item.product.stock < item.quantity) {
            throw new Error(
              `Insufficient stock for ${item.product.name}`
            );
          }
        }

        // 3️⃣ Calculate total (TYPE SAFE)
        const totalAmount = cartItems.reduce<number>(
          (sum, item) =>
            sum + item.product.price * item.quantity,
          0
        );

        // 4️⃣ Create Bill
        const bill = await tx.bill.create({
          data: { totalAmount },
        });

        // 5️⃣ Create BillItems + decrement stock
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

        // 6️⃣ Clear cart
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
