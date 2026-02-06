"use client";

import { useEffect, useState } from "react";
import styles from "./manual-stock.module.css";

type Product = {
  id: number;
  name: string;
  stock: number;
};

export default function ManualStockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState<number | null>(null);
  const [qty, setQty] = useState(0);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.data || []));
  }, []);

  const submit = async () => {
    if (!productId || qty === 0 || !reason.trim()) {
      setMessage("All fields are required");
      return;
    }

    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/products/stock/manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, qty, reason }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(data.message || "Failed to update stock");
      return;
    }

    setQty(0);
    setReason("");
    setProductId(null);
    setMessage("✅ Stock updated successfully");
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1>Manual Stock Adjustment</h1>
        <p>
          Increase or decrease stock manually with a
          mandatory reason.
        </p>
      </div>

      <div className={styles.card}>
        {/* Product */}
        <label className={styles.label}>Product</label>
        <select
          className={styles.select}
          value={productId ?? ""}
          onChange={(e) =>
            setProductId(Number(e.target.value))
          }
        >
          <option value="">Select product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} (Stock: {p.stock})
            </option>
          ))}
        </select>

        {/* Quantity */}
        <label className={styles.label}>
          Quantity (+ / −)
        </label>
        <input
          className={styles.input}
          type="number"
          placeholder="e.g. 10 or -5"
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
        />

        {/* Reason */}
        <label className={styles.label}>
          Reason (mandatory)
        </label>
        <textarea
          className={styles.textarea}
          placeholder="Reason for stock adjustment"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        {message && (
          <div className={styles.infoBox}>
            {message}
          </div>
        )}

        <button
          className={styles.button}
          onClick={submit}
          disabled={loading}
        >
          {loading ? "Updating..." : "Apply Adjustment"}
        </button>
      </div>
    </div>
  );
}
