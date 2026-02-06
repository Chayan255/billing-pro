import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import csv from "csv-parser";
import { Readable } from "stream";

export async function POST(req: Request) {
  const user = await getAuthUser();

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

  await new Promise<void>((resolve, reject) => {
    Readable.from(buffer)
      .pipe(csv())
      .on("data", (row) => rows.push(row))
      .on("end", resolve)
      .on("error", reject);
  });

  let created = 0;

  await prisma.$transaction(async (tx) => {
    for (const row of rows) {
      const sku = row.sku?.trim();
      const name = row.name?.trim();
      const qty = Number(row.stock);

      if (!sku || isNaN(qty)) continue;

      // ✅ OWNER SAFE lookup
      let product = await tx.product.findFirst({
        where: {
          ownerId: user.id,
          sku,
        },
      });

      // ✅ CREATE if not exists
      if (!product) {
        product = await tx.product.create({
          data: {
            ownerId: user.id,
            sku,
            name: name || sku,
            price: 0,
            stock: 0,
            category: "Imported",
          },
        });
      }

      // ✅ STOCK UPDATE
      await tx.product.update({
        where: { id: product.id },
        data: {
          stock: {
            increment: qty,
          },
        },
      });

      // ✅ STOCK LOG
      await tx.stockLog.create({
        data: {
          ownerId: user.id,
          productId: product.id,
          change: qty,
          type: "IMPORT",
          reason: "CSV stock import",
        },
      });

      created++;
    }
  });

  return NextResponse.json({
    message: `Imported ${created} items`,
  });
}
