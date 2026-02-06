import { prisma } from "@/lib/db";
import styles from "./dashboard.module.css";

export default async function DashboardHome() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const [
    todaySales,
    totalInvoices,
    totalProducts,
    lowStockCount,
    recentInvoices,
  ] = await Promise.all([
    prisma.bill.aggregate({
      _sum: { totalAmount: true },
      where: {
        createdAt: { gte: startOfToday, lte: endOfToday },
      },
    }),

    prisma.bill.count(),

    prisma.product.count(),

    prisma.product.count({
      where: { stock: { lt: 5 } },
    }),

    prisma.bill.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className={styles.container}>
      {/* METRIC CARDS */}
      <div className={styles.cards}>
        <Metric
          label="Today Sales"
          value={`₹ ${
            todaySales._sum.totalAmount?.toFixed(2) ?? "0.00"
          }`}
        />
        <Metric label="Total Invoices" value={totalInvoices} />
        <Metric label="Products" value={totalProducts} />
        <Metric label="Low Stock Items" value={lowStockCount} danger />
      </div>

      {/* RECENT INVOICES */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>🧾 Recent Invoices</h2>

        {recentInvoices.length === 0 ? (
          <div className={styles.empty}>No invoices yet</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th className={styles.right}>Total</th>
              </tr>
            </thead>
            <tbody>
              {recentInvoices.map((bill) => (
                <tr key={bill.id}>
                  <td>#{bill.id}</td>
                  <td>
                    {new Date(bill.createdAt).toLocaleDateString()}
                  </td>
                  <td className={styles.right}>
                    ₹ {bill.totalAmount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  danger,
}: {
  label: string;
  value: any;
  danger?: boolean;
}) {
  return (
    <div
      className={`${styles.card} ${
        danger ? styles.danger : ""
      }`}
    >
      <span className={styles.cardLabel}>{label}</span>
      <span className={styles.cardValue}>{value}</span>
    </div>
  );
}
