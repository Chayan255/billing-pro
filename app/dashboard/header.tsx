"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./dashboard.module.css";

export default function Header() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      window.location.href = "/login";
    }
  };

  return (
    <header className={styles.header}>
      {/* 🔒 SAME TAG ALWAYS */}
      <h1 className={styles.title}>Softa</h1>

      <div className={styles.profile} ref={dropdownRef}>
        <button
          className={styles.profileBtn}
          onClick={() => setOpen((p) => !p)}
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <div className={styles.avatar}>A</div>

          <div className={styles.userInfo}>
            <span className={styles.userName}>Admin</span>
            <span className={styles.userRole}>Administrator</span>
          </div>

          <span
            className={`${styles.chevron} ${
              open ? styles.chevronOpen : ""
            }`}
          >
            ▾
          </span>
        </button>

        {open && (
          <div className={styles.dropdown} role="menu">
            <button className={styles.dropdownItem}>
              Profile
            </button>
            <button
              className={`${styles.dropdownItem} ${styles.logout}`}
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
