"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./register.module.css";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!name || !businessName || !email || !password || !businessType) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        businessName,
        email,
        password,
        businessType,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.message || "Registration failed");
      return;
    }

    router.push("/login");
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subTitle}>
          Start managing your business professionally
        </p>

        {error && <div className={styles.errorBox}>{error}</div>}

        <div className={styles.field}>
          <label>Owner Name</label>
          <input value={name} onChange={e => setName(e.target.value)} />
        </div>

        <div className={styles.field}>
          <label>Business Name</label>
          <input value={businessName} onChange={e => setBusinessName(e.target.value)} />
        </div>

        <div className={styles.field}>
          <label>Email Address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>

        <div className={styles.field}>
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>

        <div className={styles.field}>
          <label>Business Type</label>
          <select value={businessType} onChange={e => setBusinessType(e.target.value)}>
            <option value="">Select business type</option>
            <option value="MEDICINE">Medicine</option>
            <option value="GROCERY">Grocery</option>
            <option value="SHOPPING_MALL">Shopping Mall</option>
            <option value="GARMENTS">Garments</option>
          </select>
        </div>

        <button className={styles.button} onClick={submit} disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className={styles.footerText}>
          Already have an account?{" "}
          <span onClick={() => router.push("/login")}>Login</span>
        </p>
      </div>
    </div>
  );
}
