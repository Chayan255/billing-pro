import styles from "./invoice.module.css";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import InvoicePrintButton from "./print-button";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ billId: string }>;
}) {
  const { billId } = await params;
  const id = Number(billId);
  if (!id) notFound();

  const bill = await prisma.bill.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
    },
  });

  if (!bill) notFound();

  return (
    <div className={styles.printArea}>
    <div className={styles.container}>
      {/* ================= COMPANY ================= */}
      <div className={styles.header}>
        <h1 className={styles.title}>{bill.companyName}</h1>
        <div className={styles.subTitle}>
          {bill.companyAddress || ""}
        </div>
        <div className={styles.subTitle}>
          GSTIN: {bill.companyGstin}
        </div>
      </div>

      {/* ================= INVOICE META ================= */}
      <div className={styles.metaGrid}>
        <div>
          <strong>Invoice No:</strong> {bill.id}
        </div>
        <div>
          <strong>Date:</strong>{" "}
          {new Date(bill.createdAt).toLocaleDateString()}
        </div>
        <div>
          <strong>Payment:</strong>{" "}
          {bill.paymentMethod || "CASH"}
        </div>
      </div>

      {/* ================= CUSTOMER ================= */}
      <div className={styles.customerBox}>
        <div>
          <strong>Billed To:</strong>
        </div>
        <div>{bill.customerName || "Walk-in Customer"}</div>
        {bill.customerMobile && (
          <div>Mobile: {bill.customerMobile}</div>
        )}
      </div>

      {/* ================= ITEMS ================= */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Sl</th>
            <th>Item Description</th>
            <th className={styles.textRight}>Qty</th>
            <th className={styles.textRight}>Rate</th>
            <th className={styles.textRight}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {bill.items.map((item, idx) => (
            <tr key={item.id}>
              <td>{idx + 1}</td>
              <td>{item.product.name}</td>
              <td className={styles.textRight}>
                {item.quantity}
              </td>
              <td className={styles.textRight}>
                ₹{item.price.toFixed(2)}
              </td>
              <td className={styles.textRight}>
                ₹
                {(
                  item.price * item.quantity
                ).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= TOTAL ================= */}
      <div className={styles.summary}>
        <div>
          <span>Taxable Amount</span>
          <span>
            ₹{bill.taxableAmount.toFixed(2)}
          </span>
        </div>
        <div>
          <span>CGST @9%</span>
          <span>₹{bill.cgst.toFixed(2)}</span>
        </div>
        <div>
          <span>SGST @9%</span>
          <span>₹{bill.sgst.toFixed(2)}</span>
        </div>
        <hr />
        <div className={styles.grandTotal}>
          <strong>Grand Total</strong>
          <strong>
            ₹{bill.totalAmount.toFixed(2)}
          </strong>
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <div className={styles.footer}>
        <div className={styles.declaration}>
          <strong>Declaration:</strong>
          <p>
            We declare that this invoice shows the
            actual price of the goods described and
            that all particulars are true and correct.
          </p>
        </div>

        <div className={styles.signature}>
          <p>For {bill.companyName}</p>
          <div className={styles.signLine} />
          <p>Authorized Signatory</p>
        </div>
      </div>

      {/* ================= ACTIONS ================= */}
      <div className={styles.actions}>
        <InvoicePrintButton />
        <a
          href={`/api/invoice/${bill.id}/pdf`}
          className={styles.downloadBtn}
        >
          ⬇️ Download PDF
        </a>
      </div>
    </div>
    </div>
  );
}
