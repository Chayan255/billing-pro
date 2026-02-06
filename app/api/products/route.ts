import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

import { requireRole } from "@/lib/role-guard";
import { getAuthUser } from "@/lib/auth";

/* ======================
   GET: Product List
====================== */
export async function GET(req: Request) {
  try {
    const user = await getAuthUser();
    requireRole(user.role, ["ADMIN", "STAFF"]);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";

    const where = {
      ownerId: user.id,
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { sku: { contains: search } },
              { category: { contains: search } },
            ],
          }
        : {}),
    };

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: products });
  } catch (e) {
    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

/* ======================
   POST: Create Product
====================== */
export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    requireRole(user.role, ["ADMIN"]);

    const body = await req.json();
    const {
      name,
      sku,
      price,
      stock,
      category,
      hsnCode,
      lowStockLevel,
    } = body;

    if (!name || !sku || !price || !stock || !category) {
      return NextResponse.json(
        { message: "All required fields missing" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        ownerId: user.id, // 🔒 CRITICAL
        name,
        sku,
        price: Number(price),
        stock: Number(stock),
        category,
        hsnCode: hsnCode || null,
        lowStockLevel: lowStockLevel
          ? Number(lowStockLevel)
          : 5,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { message: e.message ?? "Create failed" },
      { status: 500 }
    );
  }
}
