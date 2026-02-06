"use client";

import { useEffect, useState } from "react";

type Log = {
  id: number;
  product: { name: string };
  change: number;
  type: string;
  reason: string | null;
  createdAt: string;
  user: { name: string; role: string };
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

    setLogs(data.data || []);
    setLoading(false);
  };

  // auto load on filter change
  useEffect(() => {
    load();
  }, [type, from, to]);

  const exportCSV = () => {
    const params = new URLSearchParams();
    if (type) params.append("type", type);
    if (from) params.append("from", from);
    if (to) params.append("to", to);

    window.open(
      `/api/products/stock/history/export?${params.toString()}`,
      "_blank"
    );
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>📊 Stock History</h1>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 20,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All Types</option>
          <option value="MANUAL">Manual</option>
          <option value="PURCHASE">Purchase</option>
          <option value="BILL">Bill</option>
          <option value="IMPORT">Import</option>
        </select>

        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />

        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />

        <button onClick={exportCSV}>⬇ Export CSV</button>
      </div>

      {/* States */}
      {loading && <p>Loading history...</p>}

      {!loading && logs.length === 0 && (
        <p style={{ opacity: 0.7 }}>No stock history found</p>
      )}

      {/* Table */}
      {!loading && logs.length > 0 && (
        <table border={1} cellPadding={8} width="100%">
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Change</th>
              <th>Type</th>
              <th>Reason</th>
              <th>By</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <td>{new Date(l.createdAt).toLocaleString()}</td>
                <td>{l.product.name}</td>
                <td
                  style={{
                    color: l.change > 0 ? "green" : "red",
                    fontWeight: "bold",
                  }}
                >
                  {l.change > 0 ? `+${l.change}` : l.change}
                </td>
                <td>{l.type}</td>
                <td>{l.reason || "-"}</td>
                <td>
                  {l.user.name} ({l.user.role})
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
