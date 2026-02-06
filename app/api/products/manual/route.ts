import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { requireRole } from "@/lib/role-guard";

export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    requireRole(user.role, ["ADMIN", "STAFF"]);

    const body = await req.json();

    const name = body.name?.trim();
    const sku = body.sku?.trim();
    const price = Number(body.price);
    const stock = Number(body.stock);
    const category = body.category || "General";

    if (!name || !sku || isNaN(price) || isNaN(stock)) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    /* 🔒 SKU UNIQUE PER OWNER */
    const existing = await prisma.product.findFirst({
      where: {
        ownerId: user.id,
        sku,
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: "SKU already exists" },
        { status: 409 }
      );
    }

    /* 🔁 TRANSACTION */
    const product = await prisma.$transaction(async (tx) => {
      const p = await tx.product.create({
        data: {
          ownerId: user.id,
          name,
          sku,
          price,
          stock,
          category,
        },
      });

      if (stock > 0) {
        await tx.stockLog.create({
          data: {
            ownerId: user.id,
            productId: p.id,
            change: stock,
            type: "MANUAL",
            reason: "Manual opening stock",
          },
        });
      }

      return p;
    });

    return NextResponse.json({
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    console.error("Manual product error:", error);
    return NextResponse.json(
      { message: "Failed to add product" },
      { status: 500 }
    );
  }
}
