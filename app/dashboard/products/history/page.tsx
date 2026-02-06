"use client";

import { useEffect, useState } from "react";

type Log = {
  id: number;
  change: number;
  type: string;
  reason: string | null;
  createdAt: string;

  product?: {
    name?: string;
  } | null;

  user?: {
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
    <div style={{ padding: 30 }}>
      <h1>📊 Stock History</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All</option>
          <option value="MANUAL">Manual</option>
          <option value="PURCHASE">Purchase</option>
          <option value="BILL">Bill</option>
          <option value="IMPORT">Import</option>
        </select>

        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>

      {loading && <p>Loading...</p>}

      {!loading && logs.length === 0 && <p>No history found</p>}

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

                <td>
                  {l.product?.name
                    ? l.product.name
                    : <span style={{ color: "#999" }}>—</span>}
                </td>

                <td style={{ color: l.change > 0 ? "green" : "red" }}>
                  {l.change > 0 ? `+${l.change}` : l.change}
                </td>

                <td>{l.type}</td>
                <td>{l.reason || "-"}</td>

                <td>
                  {l.user?.name
                    ? `${l.user.name} (${l.user.role ?? ""})`
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
