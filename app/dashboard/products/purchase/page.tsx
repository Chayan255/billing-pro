"use client";

import { useEffect, useState } from "react";
import styles from "./purchase.module.css";

type Product = {
  id: number;
  name: string;
  stock: number;
};

export default function PurchasePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState<number | "">("");
  const [supplier, setSupplier] = useState("");
  const [qty, setQty] = useState<number | "">("");
  const [costPrice, setCostPrice] = useState<number | "">("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadProducts = async () => {
    const res = await fetch("/api/products");
    const data = await res.json();
    if (res.ok) setProducts(data.data || []);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const submit = async () => {
    if (!productId || !supplier.trim() || !qty) {
      setMessage("❌ Product, supplier and quantity required");
      return;
    }

    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/products/stock/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        supplier,
        qty: Number(qty),
        costPrice: costPrice ? Number(costPrice) : null,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(data.message || "❌ Failed to save purchase");
      return;
    }

    setSupplier("");
    setQty("");
    setCostPrice("");
    setMessage("✅ Purchase entry saved & stock updated");

    loadProducts();
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>📦 New Stock Purchase</h1>
        <p className={styles.subtitle}>
          Add new stock received from supplier
        </p>

        <div className={styles.field}>
          <label>Product</label>
          <select
            value={productId}
            onChange={(e) => setProductId(Number(e.target.value))}
          >
            <option value="">Select product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (Stock: {p.stock})
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label>Supplier Name</label>
          <input
            type="text"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            placeholder="e.g. ABC Distributors"
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>Quantity</label>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
            />
          </div>

          <div className={styles.field}>
            <label>Cost Price (optional)</label>
            <input
              type="number"
              step="0.01"
              value={costPrice}
              onChange={(e) => setCostPrice(Number(e.target.value))}
              placeholder="per unit"
            />
          </div>
        </div>

        <button
          className={styles.submitBtn}
          onClick={submit}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Purchase"}
        </button>

        {message && <div className={styles.message}>{message}</div>}
      </div>
    </div>
  );
}
