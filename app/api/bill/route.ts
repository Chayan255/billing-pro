import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/role-guard";
import type { Prisma } from "@prisma/client";
import { getAuthUser } from "@/lib/auth";

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
        /* ======================
           LOAD CART (OWNER SAFE)
        ====================== */
        const cartItems = await tx.cartItem.findMany({
          where: {
            ownerId: user.id,              // ✅ FIXED
            product: {
              ownerId: user.id,            // ✅ FIXED
            },
          },
          include: {
            product: true,
          },
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

        const roundOff =
          typeof body.roundOff === "number"
            ? body.roundOff
            : 0;

        for (const item of cartItems) {
          const base = item.price * item.quantity;

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
          taxableAmount + cgst + sgst + roundOff;

        /* ======================
           CREATE BILL (OWNER SAFE)
           ⚠️ company fields REMOVED
        ====================== */
       const bill = await tx.bill.create({
  data: {
    ownerId: user.id,

    // ✅ REQUIRED COMPANY FIELDS
    companyName: user.businessName,
    companyGstin: body.companyGstin || null,
    companyAddress: body.companyAddress || null,
    companyState: body.companyState || null,
    companyStateCode: body.companyStateCode || null,

    customerName: body.customerName || "Walk-in Customer",
    customerMobile: body.customerMobile || null,
    customerGstin: body.customerGstin || null,

    gstType: "CGST_SGST",
    gstPercent,
    taxableAmount,
    cgst,
    sgst,
    igst,

    totalDiscount,
    roundOff,
    totalAmount,

    paymentMethod: body.paymentMethod || "CASH",
    notes: body.notes || null,
  },
});

        /* ======================
           BILL ITEMS + STOCK
        ====================== */
        for (const item of cartItems) {
          const base = item.price * item.quantity;

          const discount =
            item.discountType === "PERCENT"
              ? (base * item.discount) / 100
              : item.discount;

          const lineTotal = base - discount;

          // 1️⃣ Bill item
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

          // 2️⃣ Stock decrement (OWNER SAFE)
          await tx.product.updateMany({
            where: {
              id: item.productId,
              ownerId: user.id,
            },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });

          // 3️⃣ Stock log (AUDIT SAFE)
          await tx.stockLog.create({
            data: {
              ownerId: user.id,
              productId: item.productId,
              change: -item.quantity,
              type: "BILL",
              reason: `Invoice #${bill.id}`,
            },
          });
        }

        /* ======================
           CLEAR CART
        ====================== */
        await tx.cartItem.deleteMany({
          where: {
            ownerId: user.id,              // ✅ FIXED
          },
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
