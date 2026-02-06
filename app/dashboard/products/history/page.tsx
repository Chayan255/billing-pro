"use client";

import { useEffect, useState } from "react";
import styles from "./stock-history.module.css";

type Log = {
  id: number;
  change: number;
  type: string;
  reason: string | null;
  createdAt: string;

  product?: {
    name?: string;
  } | null;

  owner?: {
    name?: string;
    role?: string;
  } | null;
};

export default function StockHistoryPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [type, setType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);

    const params = new URLSearchParams();
    if (type) params.append("type", type);
    if (from) params.append("from", from);
    if (to) params.append("to", to);

    const res = await fetch(
      `/api/products/stock/history?${params.toString()}`
    );

    const data = await res.json();
    setLogs(Array.isArray(data.data) ? data.data : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [type, from, to]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.title}>📊 Stock History</h1>
        <p className={styles.subTitle}>
          Track all inventory changes
        </p>
      </div>

      {/* ================= FILTERS ================= */}
      <div className={styles.filters}>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All Types</option>
          <option value="MANUAL">Manual</option>
          <option value="PURCHASE">Purchase</option>
          <option value="BILL">Bill</option>
          <option value="IMPORT">Import</option>
        </select>

        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>

      {/* ================= STATES ================= */}
      {loading && <p className={styles.state}>Loading...</p>}

      {!loading && logs.length === 0 && (
        <p className={styles.state}>No stock history found</p>
      )}

      {/* ================= TABLE ================= */}
      {!loading && logs.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th className={styles.right}>Change</th>
                <th>Type</th>
                <th>Reason</th>
                <th>By</th>
              </tr>
            </thead>

            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td>{new Date(l.createdAt).toLocaleString()}</td>

                  <td>{l.product?.name ?? "—"}</td>

                  <td
                    className={`${styles.right} ${
                      l.change > 0 ? styles.positive : styles.negative
                    }`}
                  >
                    {l.change > 0 ? `+${l.change}` : l.change}
                  </td>

                  <td>
                    <span className={styles.badge}>{l.type}</span>
                  </td>

                  <td>{l.reason || "—"}</td>

                  <td>
                    {l.owner?.name
                      ? `${l.owner.name}${l.owner.role ? ` (${l.owner.role})` : ""}`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
