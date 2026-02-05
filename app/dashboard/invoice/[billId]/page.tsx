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
    <div className={styles.container}>
      {/* ================= HEADER ================= */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          🧾 {bill.companyName}
        </h1>
        <p className={styles.subTitle}>
          {bill.companyAddress || ""}
        </p>
        <p className={styles.subTitle}>
          GSTIN: {bill.companyGstin}
        </p>
      </div>

      {/* ================= INVOICE META ================= */}
      <div className={styles.meta}>
        <div>
          <strong>Invoice #:</strong> {bill.id}
        </div>
        <div>
          <strong>Date:</strong>{" "}
          {new Date(bill.createdAt).toLocaleString()}
        </div>
      </div>

      {/* ================= CUSTOMER ================= */}
      <div className={styles.customer}>
        <div>
          <strong>Customer:</strong>{" "}
          {bill.customerName || "Walk-in Customer"}
        </div>
        {bill.customerMobile && (
          <div>
            <strong>Mobile:</strong>{" "}
            {bill.customerMobile}
          </div>
        )}
      </div>

      {/* ================= ITEMS TABLE ================= */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Item</th>
            <th className={styles.textRight}>Qty</th>
            <th className={styles.textRight}>Price</th>
            <th className={styles.textRight}>Total</th>
          </tr>
        </thead>
        <tbody>
          {bill.items.map((item) => (
            <tr key={item.id}>
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

      {/* ================= TAX SUMMARY ================= */}
      <div className={styles.summary}>
        <div>
          <span>Taxable Amount</span>
          <span>
            ₹{bill.taxableAmount.toFixed(2)}
          </span>
        </div>
        <div>
          <span>CGST (9%)</span>
          <span>₹{bill.cgst.toFixed(2)}</span>
        </div>
        <div>
          <span>SGST (9%)</span>
          <span>₹{bill.sgst.toFixed(2)}</span>
        </div>
        <hr />
        <div className={styles.grandTotal}>
          <strong>Total</strong>
          <strong>
            ₹{bill.totalAmount.toFixed(2)}
          </strong>
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
  );
}
