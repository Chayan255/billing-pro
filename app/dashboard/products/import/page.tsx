"use client";

import { useState } from "react";
import styles from "./import-stock.module.css";

export default function ImportStockPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upload = async () => {
    if (!file) {
      setError("Please select a CSV file");
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/products/stock/import", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.message || "Import failed");
      return;
    }

    setMessage(data.message || "Import completed");
    setFile(null);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1>Stock Import</h1>
        <p>Upload opening stock or bulk stock update using CSV file.</p>
      </div>

      <div className={styles.card}>
        <label className={styles.label}>CSV File</label>

        <input
          type="file"
          accept=".csv"
          className={styles.fileInput}
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <div className={styles.csvHelp}>
          <strong>CSV Format</strong>
          <pre>
sku,name,stock
SKU001,Paracetamol,100
SKU002,Crocin,50
          </pre>
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {message && <div className={styles.success}>{message}</div>}

        <button
          className={styles.button}
          onClick={upload}
          disabled={loading}
        >
          {loading ? "Importing..." : "Upload & Import"}
        </button>
      </div>
    </div>
  );
}
