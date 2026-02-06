"use client";

import { useState } from "react";
import styles from "./login.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.message || "Login failed");
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subTitle}>
          Login to continue to your dashboard
        </p>

        {error && <div className={styles.errorBox}>{error}</div>}

        <div className={styles.field}>
          <label>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className={styles.button}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className={styles.footerText}>
          Don’t have an account?{" "}
          <span onClick={() => (window.location.href = "/register")}>
            Create one
          </span>
        </p>
      </div>
    </div>
  );
}
