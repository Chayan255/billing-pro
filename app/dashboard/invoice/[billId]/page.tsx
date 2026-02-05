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
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>🧾 Billing Pro</h1>
        <p className={styles.subTitle}>
          Invoice #{bill.id} •{" "}
          {new Date(bill.createdAt).toLocaleString()}
        </p>
      </div>

      {/* Table */}
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
              <td className={styles.textRight}>{item.quantity}</td>
              <td className={styles.textRight}>
                ₹{item.price.toFixed(2)}
              </td>
              <td className={styles.textRight}>
                ₹{(item.price * item.quantity).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total */}
      <div className={styles.totalWrapper}>
        <div className={styles.total}>
          Total: ₹{bill.totalAmount.toFixed(2)}
        </div>
      </div>

      {/* Print */}
      <div>
        <InvoicePrintButton />
      </div>
      <a
  href={`/api/invoice/${bill.id}/pdf`}
  className="inline-block mt-4 px-5 py-2 bg-black text-white rounded"
>
  ⬇️ Download PDF
</a>

    </div>
  );
}
