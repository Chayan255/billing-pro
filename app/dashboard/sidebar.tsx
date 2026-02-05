import Link from "next/link";
import styles from "./dashboard.module.css";

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.logo}>🧾</span>
        <span className={styles.brandName}>Billing Pro</span>
      </div>

      <nav className={styles.menu}>
        <Link href="/dashboard" className={styles.menuItem}>Dashboard</Link>
        <Link href="/dashboard/invoices" className={styles.menuItem}>Invoices</Link>
        <Link href="/dashboard/products" className={styles.menuItem}>Products</Link>
        <Link href="/dashboard/customers" className={styles.menuItem}>Customers</Link>
        <Link href="/dashboard/reports" className={styles.menuItem}>Reports</Link>
        <Link href="/dashboard/settings" className={styles.menuItem}>Settings</Link>
      </nav>
    </aside>
  );
}
