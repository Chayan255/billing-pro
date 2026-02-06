"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ADMIN");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setSuccess(null);

    if (!name || !email || !password) {
      setError("All fields are required");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        role,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.message || "Registration failed");
      return;
    }

    setSuccess("Account created successfully. Please login.");
    setTimeout(() => router.push("/login"), 1500);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create Account</h1>
        <p style={styles.subtitle}>
          Register your store admin account
        </p>

        <input
          style={styles.input}
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <select
          style={styles.input}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="ADMIN">Admin (Store Owner)</option>
          <option value="STAFF">Staff</option>
          <option value="CASHIER">Cashier</option>
        </select>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <button
          style={styles.button}
          onClick={submit}
          disabled={loading}
        >
          {loading ? "Creating..." : "Register"}
        </button>
      </div>
    </div>
  );
}

const styles: any = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f4f6f8",
  },
  card: {
    width: 380,
    background: "#fff",
    padding: 30,
    borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  title: {
    marginBottom: 4,
    fontSize: 22,
  },
  subtitle: {
    marginBottom: 20,
    color: "#666",
    fontSize: 14,
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    marginBottom: 12,
    borderRadius: 6,
    border: "1px solid #ccc",
    fontSize: 14,
  },
  button: {
    width: "100%",
    padding: "10px",
    borderRadius: 6,
    border: "none",
    background: "#111",
    color: "#fff",
    fontSize: 15,
    cursor: "pointer",
  },
  error: {
    background: "#ffe6e6",
    color: "#c00",
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
    fontSize: 13,
  },
  success: {
    background: "#e6ffea",
    color: "#0a7a2f",
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
    fontSize: 13,
  },
};
