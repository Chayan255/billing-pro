// app/dashboard/layout.tsx
import styles from "./dashboard.module.css";
import Header from "./header";
import Sidebar from "./sidebar";
import { getAuthUser } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 🔐 HARD SERVER GUARD (Next 16)
  await getAuthUser();

  return (
    <div className={styles.appLayout}>
      <Header />
      <div className={styles.main}>
        <Sidebar />
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
