"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./dashboard.module.css";

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className={styles.sidebar}>
      {/* Brand */}
      <div className={styles.brand}>
        <span className={styles.logo}>🧾</span>
        <span className={styles.brandName}>Softa</span>
      </div>

      <nav className={styles.menu}>
        {/* DASHBOARD */}
        <Link
          href="/dashboard"
          className={`${styles.menuItem} ${
            isActive("/dashboard") ? styles.active : ""
          }`}
        >
          🏠 Dashboard
        </Link>

        {/* BILLING */}
        <div className={styles.menuSection}>Billing</div>

        <Link
          href="/dashboard/billing"
          className={`${styles.menuItem} ${
            isActive("/dashboard/billing")
              ? styles.activePrimary
              : ""
          }`}
        >
          ➕ Create Invoice
        </Link>

        <Link
          href="/dashboard/invoices"
          className={`${styles.menuItem} ${
            isActive("/dashboard/invoices")
              ? styles.active
              : ""
          }`}
        >
          🧾 Invoices
        </Link>

        {/* INVENTORY */}
        <div className={styles.menuSection}>Inventory</div>

        <Link
          href="/dashboard/products"
          className={`${styles.menuItem} ${
            isActive("/dashboard/products")
              ? styles.active
              : ""
          }`}
        >
          📦 Products
        </Link>

        <Link
          href="/dashboard/products/history"
          className={`${styles.menuItem} ${
            isActive("/dashboard/products/history")
              ? styles.active
              : ""
          }`}
        >
          📊 Stock History
        </Link>

       

        <Link
          href="/dashboard/products/manual"
          className={`${styles.menuItem} ${
            isActive("/dashboard/products/manual")
              ? styles.active
              : ""
          }`}
        >
          🛠 Manual Stock Adjust
        </Link>

        <Link
          href="/dashboard/products/purchase"
          className={`${styles.menuItem} ${
            isActive("/dashboard/products/purchase")
              ? styles.active
              : ""
          }`}
        >
          🧺 Purchase / New Stock
        </Link>

        <Link
          href="/dashboard/products/import"
          className={`${styles.menuItem} ${
            isActive("/dashboard/products/import")
              ? styles.active
              : ""
          }`}
        >
          📥 Stock Import (CSV)
        </Link>
        <Link
          href="/dashboard/products/manual-products-add"
          className={`${styles.menuItem} ${
            isActive("/dashboard/products/import")
              ? styles.active
              : ""
          }`}
        >
          📥 Manual-Product-Add
        </Link>
 <Link
          href="/dashboard/low-stock"
          className={`${styles.menuItem} ${
            isActive("/dashboard/low-stock")
              ? styles.active
              : ""
          }`}
        >
          📉 Low Stock Alert
        </Link>
        {/* SALES */}
        <Link
          href="/dashboard/sales"
          className={`${styles.menuItem} ${
            isActive("/dashboard/sales")
              ? styles.active
              : ""
          }`}
        >
          💰 Sales
        </Link>

        {/* CRM */}
        <div className={styles.menuSection}>CRM</div>

        <Link
          href="/dashboard/customers"
          className={`${styles.menuItem} ${
            isActive("/dashboard/customers")
              ? styles.active
              : ""
          }`}
        >
          👥 Customers
        </Link>

        {/* REPORTS */}
        <div className={styles.menuSection}>Reports</div>

        <Link
          href="/dashboard/reports"
          className={`${styles.menuItem} ${
            isActive("/dashboard/reports")
              ? styles.active
              : ""
          }`}
        >
          📑 Reports
        </Link>

        {/* SYSTEM */}
        <div className={styles.menuSection}>System</div>

        <Link
          href="/dashboard/settings"
          className={`${styles.menuItem} ${
            isActive("/dashboard/settings")
              ? styles.active
              : ""
          }`}
        >
          ⚙️ Settings
        </Link>
      </nav>
    </aside>
  );
}
