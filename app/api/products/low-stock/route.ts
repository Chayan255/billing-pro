import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/role-guard";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getAuthUser();

  // 🔐 AUTH GUARD (TS + runtime safe)
  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  // 🔐 ROLE GUARD
  requireRole(user.role, ["ADMIN", "STAFF"]);

  const products = await prisma.product.findMany({
    where: {
      ownerId: user.id, // ✅ safe now
      stock: {
        lte: 5, // 🔥 FIXED (no prisma.fields)
      },
    },
    orderBy: {
      stock: "asc",
    },
  });

  return NextResponse.json({ data: products });
}
