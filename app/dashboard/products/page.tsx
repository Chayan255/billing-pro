import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/get-auth-user";
import { requireRole } from "@/lib/role-guard";
import Link from "next/link";
import styles from "./products.module.css";

export default async function ProductsPage() {
  const user = await getAuthUser();
  requireRole(user.role, ["ADMIN", "STAFF"]);

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📦 Products & Stock</h1>
        <Link
          href="/dashboard/products/purchase"
          className={styles.addBtn}
        >
          ➕ New Purchase
        </Link>
      </div>

      {products.length === 0 ? (
        <div className={styles.empty}>
          No products found
        </div>
      ) : (
        <div className={styles.card}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th className={styles.center}>Stock</th>
                <th className={styles.center}>Alert</th>
                <th className={styles.center}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const isLow = p.stock <= p.lowStockLevel;

                return (
                  <tr key={p.id}>
                   <td className={styles.product}>
  <Link href={`/dashboard/products/${p.id}`}>
    {p.name}
  </Link>
</td>

                    <td>{p.category}</td>

                    <td
                      className={`${styles.center} ${
                        isLow ? styles.lowStock : ""
                      }`}
                    >
                      {p.stock}
                    </td>

                    <td className={styles.center}>
                      {p.lowStockLevel}
                    </td>

                    <td className={styles.center}>
                      <div className={styles.actions}>
                        <Link
                          href="/dashboard/products/history"
                          className={styles.link}
                        >
                          History
                        </Link>

                        <Link
                          href="/dashboard/products/purchase"
                          className={styles.link}
                        >
                          Purchase
                        </Link>

                        <Link
                          href="/dashboard/products/manual"
                          className={styles.link}
                        >
                          Adjust
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
