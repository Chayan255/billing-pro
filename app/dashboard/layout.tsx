
import styles from "./dashboard.module.css";
import Header from "./header";
import Sidebar from "./sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.appLayout}>
      <Header/>

      <div className={styles.main}>
        <Sidebar/>

        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}
