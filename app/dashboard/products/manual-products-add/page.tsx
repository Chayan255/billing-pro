"use client";

import { useEffect, useState } from "react";
import styles from "./manual-product.module.css";

export default function ManualProductPage() {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* 🔥 LOAD NEXT SKU */
  useEffect(() => {
    const loadSku = async () => {
      const res = await fetch("/api/products/next-sku");
      const data = await res.json();
      if (data.sku) setSku(data.sku);
    };
    loadSku();
  }, []);

  const submit = async () => {
    setMsg(null);
    setLoading(true);

    const res = await fetch("/api/products/manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        sku,
        price: Number(price),
        stock: Number(stock),
        category,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMsg(data.message || "Failed to add product");
      return;
    }

    setMsg("✅ Product added successfully");
    setName("");
    setPrice("");
    setStock("");
    setCategory("");

    // 🔁 load next SKU again
    const next = await fetch("/api/products/next-sku").then(r => r.json());
    setSku(next.sku);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Add Product Manually</h1>
        <p className={styles.subTitle}>
          SKU auto-generated — you can edit if needed
        </p>

        {msg && <div className={styles.message}>{msg}</div>}

        <div className={styles.field}>
          <label>Product Name</label>
          <input value={name} onChange={e => setName(e.target.value)} />
        </div>

        <div className={styles.field}>
          <label>
            SKU <span style={{ opacity: 0.6 }}>(auto)</span>
          </label>
          <input value={sku} onChange={e => setSku(e.target.value)} />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>Price</label>
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label>Opening Stock</label>
            <input
              type="number"
              value={stock}
              onChange={e => setStock(e.target.value)}
            />
          </div>
        </div>

        
         <div className={styles.field}>
  <label>Category</label>

  <select
    value={category}
    onChange={(e) => setCategory(e.target.value)}
  >
    <option value="">Select category</option>
    <option value="Manual">Manual</option>
    <option value="Imported">Imported</option>
  </select>
</div>

        

        <button
          onClick={submit}
          disabled={loading}
          className={styles.button}
        >
          {loading ? "Saving..." : "Save Product"}
        </button>
      </div>
    </div>
  );
}
