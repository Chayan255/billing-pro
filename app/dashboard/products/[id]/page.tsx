import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import styles from "../products.module.css";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);

  if (isNaN(productId)) notFound();

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      stockLogs: {
        orderBy: { createdAt: "desc" },
        take: 15,
      },
    },
  });

  if (!product) notFound();

  const isLow = product.stock <= product.lowStockLevel;

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{product.name}</h1>
          <p className={styles.subTitle}>
            Category: {product.category}
          </p>
        </div>

        <div
          className={`${styles.stockBadge} ${
            isLow ? styles.low : styles.ok
          }`}
        >
          Stock: {product.stock}
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className={styles.cards}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>
            Current Stock
          </span>
          <span className={styles.cardValue}>
            {product.stock}
          </span>
        </div>

        <div className={styles.card}>
          <span className={styles.cardLabel}>
            Alert Level
          </span>
          <span className={styles.cardValue}>
            {product.lowStockLevel}
          </span>
        </div>

        <div className={styles.card}>
          <span className={styles.cardLabel}>
            Status
          </span>
          <span
            className={
              isLow ? styles.statusLow : styles.statusOk
            }
          >
            {isLow ? "Low Stock" : "Healthy"}
          </span>
        </div>
      </div>

      {/* ACTIONS */}
      <div className={styles.actions}>
        <a
          href="/dashboard/products/purchase"
          className={styles.actionBtn}
        >
          ➕ Add Stock
        </a>
        <a
          href="/dashboard/products/manual"
          className={styles.actionBtnAlt}
        >
          🛠 Manual Adjust
        </a>
      </div>

      {/* HISTORY */}
      <div className={styles.historyCard}>
        <h2>📜 Recent Stock Activity</h2>

        {product.stockLogs.length === 0 ? (
          <p className={styles.empty}>
            No stock activity found
          </p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Change</th>
                <th>Type</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {product.stockLogs.map((log) => (
                <tr key={log.id}>
                  <td>
                    {new Date(
                      log.createdAt
                    ).toLocaleString()}
                  </td>
                  <td
                    className={
                      log.change > 0
                        ? styles.plus
                        : styles.minus
                    }
                  >
                    {log.change > 0
                      ? `+${log.change}`
                      : log.change}
                  </td>
                  <td>{log.type}</td>
                  <td>{log.reason || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
