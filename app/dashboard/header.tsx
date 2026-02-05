"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./dashboard.module.css";

export default function Header() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // outside click close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerTitle}>Dashboard</div>

      <div className={styles.profile} ref={ref}>
        <button
          className={styles.profileBtn}
          onClick={() => setOpen(!open)}
        >
          <div className={styles.avatar}>A</div>
          <span className={styles.userRole}>ADMIN</span>
          <span className={styles.chevron}>▾</span>
        </button>

        {open && (
          <div className={styles.dropdown}>
            <button className={styles.dropdownItem}>
              Profile
            </button>
            <button
              className={styles.dropdownItem}
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
