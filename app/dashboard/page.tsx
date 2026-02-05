import styles from "./dashboard.module.css";

export default function DashboardHome() {
  return (
    <div className={styles.cards}>
      <div className={styles.card}>
        <p className={styles.cardLabel}>Today Sales</p>
        <h2 className={styles.cardValue}>₹ 0.00</h2>
      </div>

      <div className={styles.card}>
        <p className={styles.cardLabel}>Total Invoices</p>
        <h2 className={styles.cardValue}>0</h2>
      </div>

      <div className={styles.card}>
        <p className={styles.cardLabel}>Products</p>
        <h2 className={styles.cardValue}>0</h2>
      </div>

      <div className={styles.card}>
        <p className={styles.cardLabel}>Low Stock</p>
        <h2 className={styles.cardValue}>0</h2>
      </div>
    </div>
  );
}
