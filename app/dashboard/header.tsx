"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  // 🔐 Fetch logged-in user
  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then(async (r) => {
        if (r.status === 401) {
          window.location.replace("/login");
          return;
        }
        setMe(await r.json());
      })
      .catch(() => window.location.replace("/login"));
  }, []);

  // 🔽 Close dropdown on outside click
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
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // 🚪 LOGOUT (FIXED)
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include", // 🔥 MUST
      });
    } finally {
      // 🔥 Hard redirect = clear client state
      window.location.replace("/login");
    }
  };

  const goProfile = () => {
    setOpen(false);
    router.push("/dashboard/profile");
  };

  const initial = me?.name?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <h1 className={styles.title}>Softa</h1>
        {me?.businessType && (
          <span className={styles.businessTag}>
            {me.businessType.replace("_", " ")}
          </span>
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
            <span className={styles.userRole}>{me?.role}</span>
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
            <button
              className={styles.dropdownItem}
              onClick={goProfile}
            >
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
