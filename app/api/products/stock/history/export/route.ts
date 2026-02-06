import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

import { requireRole } from "@/lib/role-guard";

export async function GET(req: Request) {
  try {
    const user = await getAuthUser();
    requireRole(user.role, ["ADMIN", "STAFF"]);

    const { searchParams } = new URL(req.url);

    const type = searchParams.get("type");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    // 🔒 OWNER ISOLATION
    const where: any = {
      ownerId: user.id,
    };

    if (type) where.type = type;

    if (from || to) {
      where.createdAt = {};

      if (from) {
        const fromDate = new Date(from);
        fromDate.setHours(0, 0, 0, 0);
        where.createdAt.gte = fromDate;
      }

      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = toDate;
      }
    }

    const logs = await prisma.stockLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: { name: true, sku: true },
        },
        owner: {
          select: { name: true, role: true },
        },
      },
    });

    // 📄 CSV HEADER
    let csv =
      "Date,Product,SKU,Change,Type,Reason,User,Role\n";

    for (const l of logs) {
      csv += `"${new Date(
        l.createdAt
      ).toLocaleString()}","${l.product.name}","${
        l.product.sku
      }",${l.change},${l.type},"${
        l.reason ?? ""
      }","${l.owner.name}",${l.owner.role}\n`;
    }

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition":
          "attachment; filename=stock-history.csv",
      },
    });
  } catch (error) {
    console.error("Stock export error:", error);
    return new Response("Export failed", {
      status: 500,
    });
  }
}
