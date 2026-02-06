import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

import { requireRole } from "@/lib/role-guard";
import { getAuthUser } from "@/lib/auth";

/* ======================
   GET: Single Product
====================== */
export async function GET(
  _: Request,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser();

  const product = await prisma.product.findFirst({
    where: {
      id: Number(params.id),
      ownerId: user.id, // 🔒 OWNER CHECK
    },
  });

  if (!product) {
    return NextResponse.json(
      { message: "Not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(product);
}

/* ======================
   PUT: Update Product
====================== */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser();
  requireRole(user.role, ["ADMIN"]);

  const body = await req.json();

  const updated = await prisma.product.updateMany({
    where: {
      id: Number(params.id),
      ownerId: user.id, // 🔒 OWNER CHECK
    },
    data: body,
  });

  if (updated.count === 0) {
    return NextResponse.json(
      { message: "Update failed" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}

/* ======================
   DELETE: Remove Product
====================== */
export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser();
  requireRole(user.role, ["ADMIN"]);

  const deleted = await prisma.product.deleteMany({
    where: {
      id: Number(params.id),
      ownerId: user.id, // 🔒 OWNER CHECK
    },
  });

  if (deleted.count === 0) {
    return NextResponse.json(
      { message: "Delete failed" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
