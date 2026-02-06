import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

import { requireRole } from "@/lib/role-guard";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getAuthUser();
  requireRole(user.role, ["ADMIN", "STAFF"]);

  const products = await prisma.product.findMany({
    where: {
      stock: {
        lte: prisma.product.fields.lowStockLevel,
      },
    },
    orderBy: {
      stock: "asc",
    },
  });

  return NextResponse.json({ data: products });
}
