import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/get-auth-user";
import { requireRole } from "@/lib/role-guard";

export async function GET(req: Request) {
  const user = await getAuthUser();
  requireRole(user.role, ["ADMIN", "STAFF"]);

  const { searchParams } = new URL(req.url);

  const productId = Number(searchParams.get("productId"));
  const type = searchParams.get("type");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: any = {};

  if (productId) where.productId = productId;
  if (type) where.type = type;

  // 🔥 DATE FIX
  if (from || to) {
    where.createdAt = {};

    if (from) {
      const fromDate = new Date(from);
      fromDate.setHours(0, 0, 0, 0); // start of day
      where.createdAt.gte = fromDate;
    }

    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999); // end of day
      where.createdAt.lte = toDate;
    }
  }

  const logs = await prisma.stockLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { name: true } },
      user: { select: { name: true, role: true } },
    },
  });

  return NextResponse.json({ data: logs });
}
