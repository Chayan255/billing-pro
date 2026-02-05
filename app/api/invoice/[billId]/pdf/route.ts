export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import PDFDocument from "pdfkit";


export async function GET(
  _req: Request,
  context: { params: Promise<{ billId: string }> }
) {
  const { billId } = await context.params;
  const id = Number(billId);

  if (!id) {
    return NextResponse.json(
      { message: "Invalid bill id" },
      { status: 400 }
    );
  }

  const bill = await prisma.bill.findUnique({
    where: { id },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!bill) {
    return NextResponse.json(
      { message: "Invoice not found" },
      { status: 404 }
    );
  }

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const chunks: Buffer[] = [];

  doc.on("data", (chunk) => chunks.push(chunk));

  // Header
  doc.fontSize(20).text("Billing Pro", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(12).text(`Invoice #${bill.id}`, { align: "center" });
  doc.text(
    `Date: ${new Date(bill.createdAt).toLocaleString()}`,
    { align: "center" }
  );

  doc.moveDown(2);

  // Table Header
  doc.text("Item", 50);
  doc.text("Qty", 300);
  doc.text("Price", 360);
  doc.text("Total", 440);
  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.5);

  // Items
  bill.items.forEach((item) => {
    doc.text(item.product.name, 50);
    doc.text(item.quantity.toString(), 300);
    doc.text(`₹${item.price.toFixed(2)}`, 360);
    doc.text(
      `₹${(item.price * item.quantity).toFixed(2)}`,
      440
    );
    doc.moveDown(0.5);
  });

  doc.moveDown(1);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(1);

  doc
    .fontSize(14)
    .text(`Total: ₹${bill.totalAmount.toFixed(2)}`, {
      align: "right",
    });

  doc.end();

  const pdfBuffer = await new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

 return new Response(
  new Uint8Array(pdfBuffer),
  {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=invoice-${bill.id}.pdf`,
    },
  }
);


}
