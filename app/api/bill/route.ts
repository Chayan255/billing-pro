import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/get-auth-user";
import { requireRole } from "@/lib/role-guard";
import type { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  const user = await getAuthUser();
  requireRole(user.role, ["ADMIN", "STAFF"]);

  let body: any = {};
  try {
    body = await req.json();
  } catch {}

  try {
    const bill = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const cartItems = await tx.cartItem.findMany({
          where: { userId: user.userId },
          include: { product: true },
        });

        if (cartItems.length === 0) {
          throw new Error("Cart is empty");
        }

        /* ======================
           STOCK CHECK
        ====================== */
        for (const item of cartItems) {
          if (item.product.stock < item.quantity) {
            throw new Error(
              `Insufficient stock for ${item.product.name}`
            );
          }
        }

        /* ======================
           CALCULATIONS
        ====================== */
        let taxableAmount = 0;
        let totalDiscount = 0;

        const gstPercent =
          typeof body.gstPercent === "number"
            ? body.gstPercent
            : 18;

        for (const item of cartItems) {
          const base =
            item.price * item.quantity;

          const discount =
            item.discountType === "PERCENT"
              ? (base * item.discount) / 100
              : item.discount;

          const lineTaxable = base - discount;

          taxableAmount += lineTaxable;
          totalDiscount += discount;
        }

        const cgst = taxableAmount * (gstPercent / 2 / 100);
        const sgst = taxableAmount * (gstPercent / 2 / 100);
        const igst = 0;

        const totalAmount =
          taxableAmount + cgst + sgst;

        /* ======================
           CREATE BILL
        ====================== */
        const bill = await tx.bill.create({
          data: {
            customerName:
              body.customerName || "Walk-in Customer",
            customerMobile: body.customerMobile || null,

            companyName: "Billing Pro",
            companyGstin: "22AAAAA0000A1Z5",
            companyAddress: "Your Company Address",

            gstType: "CGST_SGST",
            gstPercent,

            taxableAmount,
            cgst,
            sgst,
            igst,

            totalDiscount,
            roundOff: 0,
            totalAmount,

            paymentMethod:
              body.paymentMethod || "CASH",
          },
        });

        /* ======================
           BILL ITEMS + STOCK
        ====================== */
        for (const item of cartItems) {
          const base =
            item.price * item.quantity;

          const discount =
            item.discountType === "PERCENT"
              ? (base * item.discount) / 100
              : item.discount;

          const lineTotal = base - discount;

          await tx.billItem.create({
            data: {
              billId: bill.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,

              discount: item.discount,
              discountType: item.discountType,
              gstPercent: item.gstPercent,
              lineTotal,
            },
          });

          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }

        /* ======================
           CLEAR CART
        ====================== */
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
    console.error("Bill error:", error);
    return NextResponse.json(
      {
        message:
          error.message || "Failed to create bill",
      },
      { status: 400 }
    );
  }
}
