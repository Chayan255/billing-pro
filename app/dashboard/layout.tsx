import { ReactNode } from "react";
import { getAuthUser } from "@/lib/get-auth-user";
import styles from "./dashboard.module.css";
import Header from "./header";
import Sidebar from "./sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // 🔒 Server-side auth guard
  await getAuthUser();

  return (
    <div className={styles.app}>
      <Sidebar />
      <div className={styles.main}>
        <Header />
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
