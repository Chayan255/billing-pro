import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/get-auth-user";
import { requireRole } from "@/lib/role-guard";

export async function GET(req: Request) {
  const user = await getAuthUser();
  requireRole(user.role, ["ADMIN", "STAFF"]);

  const { searchParams } = new URL(req.url);

  const type = searchParams.get("type");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: any = {};
  if (type) where.type = type;

  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  const logs = await prisma.stockLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { name: true, sku: true } },
      user: { select: { name: true, role: true } },
    },
  });

  let csv =
    "Date,Product,SKU,Change,Type,Reason,User,Role\n";

  for (const l of logs) {
    csv += `"${new Date(l.createdAt).toLocaleString()}","${l.product.name}","${l.product.sku}",${l.change},${l.type},"${l.reason || ""}","${l.user.name}",${l.user.role}\n`;
  }

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition":
        "attachment; filename=stock-history.csv",
    },
  });
}
