import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/role-guard";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getAuthUser();
    requireRole(user.role, ["ADMIN", "STAFF"]);

    const { searchParams } = new URL(req.url);

    const productIdParam = searchParams.get("productId");
    const type = searchParams.get("type");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: any = {
      ownerId: user.id, // 🔒 OWNER ISOLATION
    };

    /* ======================
       PRODUCT FILTER (SAFE)
    ====================== */
    if (productIdParam) {
      const productId = Number(productIdParam);

      if (Number.isNaN(productId)) {
        return NextResponse.json(
          { message: "Invalid productId" },
          { status: 400 }
        );
      }

      const product = await prisma.product.findFirst({
        where: {
          id: productId,
          ownerId: user.id,
        },
        select: { id: true },
      });

      if (!product) {
        return NextResponse.json(
          { message: "Product not found" },
          { status: 404 }
        );
      }

      where.productId = productId;
    }

    /* ======================
       TYPE FILTER
    ====================== */
    if (type) {
      where.type = type;
    }

    /* ======================
       DATE FILTER (SAFE)
    ====================== */
    if (from || to) {
      where.createdAt = {
        ...(from && {
          gte: new Date(`${from}T00:00:00.000Z`),
        }),
        ...(to && {
          lte: new Date(`${to}T23:59:59.999Z`),
        }),
      };
    }

    /* ======================
       FETCH STOCK LOGS
    ====================== */
    const logs = await prisma.stockLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ data: logs });
  } catch (error) {
    console.error("Stock history error:", error);
    return NextResponse.json(
      { message: "Failed to fetch stock history" },
      { status: 500 }
    );
  }
}
