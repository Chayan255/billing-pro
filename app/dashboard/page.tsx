import { prisma } from "@/lib/db";
import styles from "./dashboard.module.css";

export default async function DashboardHome() {
  // 🕒 Today range
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const [
    todaySales,
    totalInvoices,
    totalProducts,
    lowStockCount,
  ] = await Promise.all([
    // Today Sales
    prisma.bill.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        createdAt: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    }),

    // Total invoices
    prisma.bill.count(),

    // Total products
    prisma.product.count(),

    // Low stock products
    prisma.product.count({
      where: {
        stock: {
          lt: 5,
        },
      },
    }),
  ]);

  return (
    <div className={styles.cards}>
      <div className={styles.card}>
        <p className={styles.cardLabel}>Today Sales</p>
        <h2 className={styles.cardValue}>
          ₹ {todaySales._sum.totalAmount?.toFixed(2) ?? "0.00"}
        </h2>
      </div>

      <div className={styles.card}>
        <p className={styles.cardLabel}>Total Invoices</p>
        <h2 className={styles.cardValue}>{totalInvoices}</h2>
      </div>

      <div className={styles.card}>
        <p className={styles.cardLabel}>Products</p>
        <h2 className={styles.cardValue}>{totalProducts}</h2>
      </div>

      <div className={styles.card}>
        <p className={styles.cardLabel}>Low Stock</p>
        <h2 className={styles.cardValue}>{lowStockCount}</h2>
      </div>
    </div>
  );
}
