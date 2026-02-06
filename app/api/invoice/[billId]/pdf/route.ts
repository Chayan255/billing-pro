import { prisma } from "@/lib/db";
import PDFDocument from "pdfkit";
import { getAuthUser } from "@/lib/auth";

/* ================= HELPER ================= */
type PdfDoc = InstanceType<typeof PDFDocument>;

function drawRow(
  doc: PdfDoc,
  y: number,
  cols: {
    text: string;
    x: number;
    width: number;
    align?: "left" | "right" | "center";
  }[]
) {
  cols.forEach(col => {
    doc.text(col.text, col.x, y, {
      width: col.width,
      align: col.align || "left",
    });
  });
}

/* ================= API ================= */
export async function GET(
  _req: Request,
  context: { params: Promise<{ billId: string }> }
) {
  const user = await getAuthUser();
  const { billId } = await context.params;
  const id = Number(billId);

  if (!id) {
    return new Response(
      JSON.stringify({ message: "Invalid bill id" }),
      { status: 400 }
    );
  }

  const bill = await prisma.bill.findFirst({
    where: {
      id,
      ownerId: user.id,
    },
    include: {
      owner: true,
      items: { include: { product: true } },
    },
  });

  if (!bill) {
    return new Response(
      JSON.stringify({ message: "Invoice not found" }),
      { status: 404 }
    );
  }

  const owner = bill.owner;

  /* ================= PDF INIT ================= */
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const chunks: Buffer[] = [];
  doc.on("data", c => chunks.push(c));

  /* ================= HEADER ================= */
  doc.font("Helvetica-Bold")
    .fontSize(20)
    .text(owner.businessName || "Business Name", 50, 50);

  doc.font("Helvetica")
    .fontSize(10)
    .text(owner.companyAddress || "-", 50, 75);

  if (owner.companyGstin) {
    doc.text(`GSTIN: ${owner.companyGstin}`, 50, 90);
  }

  doc.fontSize(10)
    .text(`Invoice No: ${bill.id}`, 380, 50)
    .text(
      `Date: ${new Date(bill.createdAt).toLocaleDateString()}`,
      380,
      65
    )
    .text(`Payment: ${bill.paymentMethod}`, 380, 80);

  doc.moveTo(50, 110).lineTo(550, 110).stroke();

  /* ================= CUSTOMER ================= */
  doc.font("Helvetica-Bold")
    .fontSize(11)
    .text("Billed To:", 50, 125);

  doc.font("Helvetica")
    .fontSize(10)
    .text(bill.customerName || "Walk-in Customer", 50, 142);

  if (bill.customerMobile) {
    doc.text(`Mobile: ${bill.customerMobile}`, 50, 158);
  }
  if (bill.customerGstin) {
    doc.text(`GSTIN: ${bill.customerGstin}`, 50, 174);
  }

  /* ================= TABLE HEADER ================= */
  let y = 210;
  doc.font("Helvetica-Bold").fontSize(10);

  drawRow(doc, y, [
    { text: "Sl", x: 50, width: 30 },
    { text: "Description", x: 80, width: 180 },
    { text: "Qty", x: 270, width: 40, align: "right" },
    { text: "Rate", x: 320, width: 60, align: "right" },
    { text: "GST%", x: 390, width: 40, align: "right" },
    { text: "Amount", x: 440, width: 90, align: "right" },
  ]);

  doc.moveTo(50, y + 15).lineTo(550, y + 15).stroke();

  /* ================= TABLE ROWS ================= */
  doc.font("Helvetica").fontSize(10);
  y += 25;

  bill.items.forEach((item, i) => {
    drawRow(doc, y, [
      { text: String(i + 1), x: 50, width: 30 },
      { text: item.product.name, x: 80, width: 180 },
      { text: String(item.quantity), x: 270, width: 40, align: "right" },
      { text: `₹${item.price.toFixed(2)}`, x: 320, width: 60, align: "right" },
      { text: `${item.gstPercent}%`, x: 390, width: 40, align: "right" },
      { text: `₹${item.lineTotal.toFixed(2)}`, x: 440, width: 90, align: "right" },
    ]);
    y += 18;
  });

  /* ================= TOTALS ================= */
  y += 15;
  doc.moveTo(350, y).lineTo(550, y).stroke();

  y += 10;
  doc.font("Helvetica").fontSize(10);
  doc.text(`Taxable Amount: ₹${bill.taxableAmount.toFixed(2)}`, 350, y, { align: "right" });
  y += 14;
  doc.text(`CGST: ₹${bill.cgst.toFixed(2)}`, 350, y, { align: "right" });
  y += 14;
  doc.text(`SGST: ₹${bill.sgst.toFixed(2)}`, 350, y, { align: "right" });

  y += 18;
  doc.font("Helvetica-Bold").fontSize(13)
    .text(`Grand Total: ₹${bill.totalAmount.toFixed(2)}`, 350, y, { align: "right" });

  /* ================= FOOTER ================= */
  doc.font("Helvetica").fontSize(9)
    .text(
      "Declaration: We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
      50,
      720,
      { width: 320 }
    );

  doc.text(`For ${owner.businessName || "Business"}`, 400, 720, { align: "right" });
  doc.moveTo(400, 750).lineTo(550, 750).stroke();
  doc.text("Authorised Signatory", 400, 755, { align: "right" });

  doc.end();

  const pdfBuffer = await new Promise<Buffer>(resolve => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=invoice-${bill.id}.pdf`,
    },
  });
}
