import { prisma } from "@/lib/db";
import Link from "next/link";
import { requireRole } from "@/lib/role-guard";
import styles from "./invoices.module.css";
import { getAuthUser } from "@/lib/auth";

export default async function InvoicesPage() {
  const user = await getAuthUser();
  requireRole(user.role, ["ADMIN", "STAFF"]);

  const bills = await prisma.bill.findMany({
    where: {
      ownerId: user.id, // 🔒 ONLY logged-in user's invoices
    },
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
    },
  });

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🧾 Invoice History</h1>

      {bills.length === 0 ? (
        <div className={styles.empty}>No invoices found</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Date</th>
              <th className={styles.right}>Items</th>
              <th className={styles.right}>Total</th>
              <th className={styles.center}>Action</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill) => (
              <tr key={bill.id}>
                <td>{bill.id}</td>
                <td>
                  {new Date(bill.createdAt).toLocaleString()}
                </td>
                <td className={styles.right}>
                  {bill.items.length}
                </td>
                <td className={styles.right}>
                  ₹{bill.totalAmount.toFixed(2)}
                </td>
                <td className={styles.center}>
                  <Link
                    href={`/dashboard/invoice/${bill.id}`}
                    className={styles.viewBtn}
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
