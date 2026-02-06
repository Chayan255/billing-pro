import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/get-auth-user";
import { requireRole } from "@/lib/role-guard";
import csv from "csv-parser";
import { Readable } from "stream";

export async function POST(req: Request) {
  const user = await getAuthUser();
  requireRole(user.role, ["ADMIN"]);

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json(
      { message: "CSV file required" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const rows: any[] = [];

  await new Promise((resolve, reject) => {
    Readable.from(buffer)
      .pipe(csv())
      .on("data", (row) => rows.push(row))
      .on("end", resolve)
      .on("error", reject);
  });

  await prisma.$transaction(async (tx) => {
    for (const row of rows) {
      const sku = row.sku?.trim();
      const name = row.name?.trim();
      const qty = Number(row.stock);

      if (!sku || isNaN(qty)) continue;

      let product = await tx.product.findUnique({
        where: { sku },
      });

      if (!product) {
        product = await tx.product.create({
          data: {
            sku,
            name: name || sku,
            price: 0,
            stock: 0,
            category: "Imported",
          },
        });
      }

      await tx.product.update({
        where: { id: product.id },
        data: {
          stock: { increment: qty },
        },
      });

      await tx.stockLog.create({
        data: {
          productId: product.id,
          change: qty,
          type: "IMPORT",
          reason: "Opening stock import",
          createdBy: user.userId,
        },
      });
    }
  });

  return NextResponse.json({
    message: `Imported ${rows.length} rows successfully`,
  });
}
