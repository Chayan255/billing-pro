import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  const user = await getAuthUser();

  const lastProduct = await prisma.product.findFirst({
    where: { ownerId: user.id },
    orderBy: { id: "desc" },
    select: { sku: true },
  });

  let nextNumber = 1;

  if (lastProduct?.sku) {
    const match = lastProduct.sku.match(/(\d+)$/);
    if (match) {
      nextNumber = Number(match[1]) + 1;
    }
  }

  const nextSku = `PRD-${String(nextNumber).padStart(4, "0")}`;

  return NextResponse.json({ sku: nextSku });
}
