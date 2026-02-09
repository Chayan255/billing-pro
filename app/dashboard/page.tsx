// app/dashboard/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { prisma } from "@/lib/db";
import styles from "./dashboard.module.css";
import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardHome() {
  let user;

  // 🔐 AUTH SAFETY
  try {
    user = await getAuthUser();
  } catch {
    // fallback safety (rare case)
    redirect("/login");
  }

  /* ======================
     TODAY RANGE (LOCAL SAFE)
  ====================== */
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  /* ======================
     QUERIES (SAFE & FAST)
  ====================== */
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
        ownerId: user.id,
        createdAt: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    }),

    prisma.bill.count({
      where: { ownerId: user.id },
    }),

    prisma.product.count({
      where: { ownerId: user.id },
    }),

    prisma.product.count({
      where: {
        ownerId: user.id,
        stock: {
          lte: prisma.product.fields.lowStockLevel,
        },
      },
    }),

    prisma.bill.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        createdAt: true,
        totalAmount: true,
      },
    }),
  ]);

  return (
    <div className={styles.container}>
      {/* ================= METRIC CARDS ================= */}
      <div className={styles.cards}>
        <Metric
          label="Today Sales"
          value={`₹ ${
            todaySales._sum.totalAmount?.toFixed(2) ?? "0.00"
          }`}
        />
        <Metric label="Total Invoices" value={totalInvoices} />
        <Metric label="Products" value={totalProducts} />
        <Metric
          label="Low Stock Items"
          value={lowStockCount}
          danger
        />
      </div>

      {/* ================= RECENT INVOICES ================= */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Recent Invoices
        </h2>

        {recentInvoices.length === 0 ? (
          <div className={styles.empty}>
            No invoices created yet
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th className={styles.right}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((bill) => (
                  <tr key={bill.id}>
                    <td>#{bill.id}</td>
                    <td>
                      {new Date(
                        bill.createdAt
                      ).toLocaleDateString()}
                    </td>
                    <td
                      className={`${styles.right} ${styles.bold}`}
                    >
                      ₹ {bill.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= METRIC CARD ================= */
function Metric({
  label,
  value,
  danger,
}: {
  label: string;
  value: string | number;
  danger?: boolean;
}) {
  return (
    <div
      className={`${styles.card} ${
        danger ? styles.danger : ""
      }`}
    >
      <span className={styles.cardLabel}>
        {label}
      </span>
      <span className={styles.cardValue}>
        {value}
      </span>
    </div>
  );
}
