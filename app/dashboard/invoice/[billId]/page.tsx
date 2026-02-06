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
      items: {
        include: { product: true },
      },
    },
  });

  if (!bill) notFound();

  return (
    <div className={styles.printRoot}>
      <div className={styles.invoice}>
        {/* ================= HEADER ================= */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.companyName}>
              {bill.companyName}
            </h1>
            <p className={styles.muted}>
              {bill.companyAddress}
            </p>
            {bill.companyGstin && (
              <p className={styles.muted}>
                <strong>GSTIN:</strong>{" "}
                {bill.companyGstin}
              </p>
            )}
          </div>

          <div className={styles.invoiceMeta}>
            <div>
              <strong>Invoice No:</strong> {bill.id}
            </div>
            <div>
              <strong>Date:</strong>{" "}
              {new Date(bill.createdAt).toLocaleDateString()}
            </div>
            <div>
              <strong>Payment:</strong>{" "}
              {bill.paymentMethod}
            </div>
          </div>
        </header>

        {/* ================= CUSTOMER ================= */}
        <section className={styles.customer}>
          <strong>Billed To</strong>
          <p>{bill.customerName || "Walk-in Customer"}</p>

          {bill.customerMobile && (
            <p>Mobile: {bill.customerMobile}</p>
          )}

          {bill.customerGstin && (
            <p>GSTIN: {bill.customerGstin}</p>
          )}
        </section>

        {/* ================= ITEMS ================= */}
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Sl</th>
              <th>Description</th>
              <th>HSN</th>
              <th className={styles.right}>Qty</th>
              <th className={styles.right}>Rate</th>
              <th className={styles.right}>Discount</th>
              <th className={styles.right}>GST</th>
              <th className={styles.right}>Amount</th>
            </tr>
          </thead>

          <tbody>
            {bill.items.map((item, idx) => {
              const base =
                item.price * item.quantity;

              const discountLabel =
                item.discountType === "PERCENT"
                  ? `${item.discount}% (₹${(
                      (base * item.discount) /
                      100
                    ).toFixed(2)})`
                  : `₹${item.discount.toFixed(2)}`;

              return (
                <tr key={item.id}>
                  <td>{idx + 1}</td>

                  <td>{item.product.name}</td>

                  <td>
                    {item.product.hsnCode || "-"}
                  </td>

                  <td className={styles.right}>
                    {item.quantity}
                  </td>

                  <td className={styles.right}>
                    ₹{item.price.toFixed(2)}
                  </td>

                  <td className={styles.right}>
                    {discountLabel}
                  </td>

                  <td className={styles.right}>
                    {item.gstPercent}%
                  </td>

                  <td className={styles.right}>
                    ₹{item.lineTotal.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* ================= TOTALS ================= */}
        <div className={styles.totals}>
          <div>
            <span>Total Discount</span>
            <span>
              ₹{bill.totalDiscount.toFixed(2)}
            </span>
          </div>

          <div>
            <span>Taxable Amount</span>
            <span>
              ₹{bill.taxableAmount.toFixed(2)}
            </span>
          </div>

          <div>
            <span>CGST</span>
            <span>₹{bill.cgst.toFixed(2)}</span>
          </div>

          <div>
            <span>SGST</span>
            <span>₹{bill.sgst.toFixed(2)}</span>
          </div>

          <div className={styles.grandTotal}>
            <strong>Grand Total</strong>
            <strong>
              ₹{bill.totalAmount.toFixed(2)}
            </strong>
          </div>
        </div>

        {/* ================= FOOTER ================= */}
        <footer className={styles.footer}>
          <p className={styles.declaration}>
            <strong>Declaration:</strong> We declare that
            this invoice shows the actual price of the goods
            described and that all particulars are true and
            correct.
          </p>

          <div className={styles.sign}>
            <p>For {bill.companyName}</p>
            <div className={styles.signLine} />
            <p>Authorised Signatory</p>
          </div>
        </footer>

        {/* ================= ACTIONS ================= */}
        <div className={styles.actions}>
          <InvoicePrintButton />
        </div>
      </div>
    </div>
  );
}
