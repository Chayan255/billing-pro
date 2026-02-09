"use client";


import styles from "./dashboard.module.css";
import Header from "./header";
import Sidebar from "./sidebar";

export default function ClientShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.app}>
      <Sidebar />
      <div className={styles.main}>
        <Header/>
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}