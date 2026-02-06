"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./dashboard.module.css";

type Me = {
  name: string;
  role: string;
  businessType: string;
};

export default function Header() {
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState<Me | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* Fetch session user */
  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then(async (r) => {
        if (r.status === 401) {
          window.location.href = "/login";
          return;
        }
        const data = await r.json();
        setMe(data);
      })
      .catch(() => {
        window.location.href = "/login";
      });
  }, []);

  /* Outside click close */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () =>
      document.removeEventListener("mousedown", handler);
  }, []);

  const logout = async () => {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "/login";
  };

  const initial =
    me?.name?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <header className={styles.header}>
      <div>
        <h1 className={styles.title}>Softa</h1>
        {me?.businessType && (
          <div className={styles.businessTag}>
            {me.businessType.replace("_", " ")}
          </div>
        )}
      </div>

      <div className={styles.profile} ref={dropdownRef}>
        <button
          className={styles.profileBtn}
          onClick={() => setOpen((p) => !p)}
        >
          <div className={styles.avatar}>{initial}</div>

          <div className={styles.userInfo}>
            <span className={styles.userName}>
              {me?.name ?? "Loading..."}
            </span>
            <span className={styles.userRole}>
              {me?.role}
            </span>
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
          <div className={styles.dropdown}>
            <button className={styles.dropdownItem}>
              Profile
            </button>

            <button
              className={`${styles.dropdownItem} ${styles.logout}`}
              onClick={logout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
