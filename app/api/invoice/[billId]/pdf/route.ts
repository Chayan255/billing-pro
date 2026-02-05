export const runtime = "nodejs";

import { prisma } from "@/lib/db";
import PDFDocument from "pdfkit";

export async function GET(
  _req: Request,
  context: { params: Promise<{ billId: string }> }
) {
  const { billId } = await context.params;
  const id = Number(billId);

  if (!id) {
    return new Response(
      JSON.stringify({ message: "Invalid bill id" }),
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
    return new Response(
      JSON.stringify({ message: "Invoice not found" }),
      { status: 404 }
    );
  }

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const chunks: Buffer[] = [];

  doc.on("data", (chunk) => chunks.push(chunk));

  /* =====================
     COMPANY HEADER
  ===================== */
  doc.fontSize(20).text(bill.companyName, { align: "center" });
  doc.moveDown(0.3);
  doc
    .fontSize(10)
    .text(bill.companyAddress ?? "-", { align: "center" });
  doc
    .text(`GSTIN: ${bill.companyGstin}`, {
      align: "center",
    });

  doc.moveDown(1);

  /* =====================
     INVOICE META
  ===================== */
  doc.fontSize(12);
  doc.text(`Invoice #: ${bill.id}`);
  doc.text(
    `Date: ${new Date(bill.createdAt).toLocaleString()}`
  );

  doc.moveDown(0.5);

  /* =====================
     CUSTOMER INFO
  ===================== */
  doc.text(
    `Customer Name: ${
      bill.customerName || "Walk-in Customer"
    }`
  );

  if (bill.customerMobile) {
    doc.text(`Mobile: ${bill.customerMobile}`);
  }

  doc.moveDown(1);

  /* =====================
     TABLE HEADER
  ===================== */
  doc.fontSize(11);
  doc.text("Item", 50);
  doc.text("Qty", 280);
  doc.text("Price", 340);
  doc.text("Total", 420);

  doc.moveDown(0.3);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.5);

  /* =====================
     ITEMS
  ===================== */
  bill.items.forEach((item) => {
    doc.text(item.product.name, 50);
    doc.text(item.quantity.toString(), 280);
    doc.text(`₹${item.price.toFixed(2)}`, 340);
    doc.text(
      `₹${(item.price * item.quantity).toFixed(2)}`,
      420
    );
    doc.moveDown(0.4);
  });

  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.8);

  /* =====================
     TAX SUMMARY
  ===================== */
  doc.fontSize(11);
  doc.text(
    `Taxable Amount: ₹${bill.taxableAmount.toFixed(2)}`,
    { align: "right" }
  );
  doc.text(`CGST (9%): ₹${bill.cgst.toFixed(2)}`, {
    align: "right",
  });
  doc.text(`SGST (9%): ₹${bill.sgst.toFixed(2)}`, {
    align: "right",
  });

  doc.moveDown(0.5);

  doc
    .fontSize(14)
    .text(
      `Grand Total: ₹${bill.totalAmount.toFixed(2)}`,
      { align: "right" }
    );

  doc.moveDown(1);

  doc
    .fontSize(10)
    .text("Thank you for your business!", {
      align: "center",
    });

  doc.end();

  const pdfBuffer = await new Promise<Buffer>((resolve) => {
    doc.on("end", () =>
      resolve(Buffer.concat(chunks))
    );
  });

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=invoice-${bill.id}.pdf`,
    },
  });
}
