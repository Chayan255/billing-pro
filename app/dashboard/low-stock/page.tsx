import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/role-guard";
import styles from "./low-stock.module.css";
import { getAuthUser } from "@/lib/auth";

export default async function LowStockPage() {
  const user = await getAuthUser();
  requireRole(user.role, ["ADMIN", "STAFF"]);

  /* 🔒 OWNER + LOW STOCK SAFE QUERY */
  const lowStock = await prisma.product.findMany({
    where: {
      ownerId: user.id, // 🔒 OWNER ISOLATION
      stock: {
        lte: prisma.product.fields.lowStockLevel,
      },
    },
    orderBy: { stock: "asc" },
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📉 Low Stock Alert</h1>
        <p>Products that need immediate attention</p>
      </div>

      {lowStock.length === 0 ? (
        <div className={styles.empty}>
          ✅ All products have sufficient stock
        </div>
      ) : (
        <div className={styles.card}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th className={styles.center}>Stock</th>
                <th className={styles.center}>Alert Level</th>
                <th className={styles.center}>Status</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map((p) => (
                <tr key={p.id}>
                  <td className={styles.product}>{p.name}</td>
                  <td>{p.category}</td>
                  <td className={styles.center}>
                    <span className={styles.stockBad}>
                      {p.stock}
                    </span>
                  </td>
                  <td className={styles.center}>
                    {p.lowStockLevel}
                  </td>
                  <td className={styles.center}>
                    <span className={styles.badge}>LOW</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
