"use client";

import { useEffect, useState } from "react";
import styles from "./profile.module.css";

export default function ProfilePage() {
  const [form, setForm] = useState<any>({});
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then(r => r.json())
      .then(setForm);
  }, []);

  const save = async () => {
    setLoading(true);
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    setMsg("✅ Profile updated successfully");
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Company Profile</h1>
        <p className={styles.subTitle}>
          Manage your business information used in invoices and reports
        </p>

        {msg && <div className={styles.message}>{msg}</div>}

        <div className={styles.field}>
          <label>Business Name</label>
          <input
            value={form.businessName || ""}
            onChange={e => setForm({ ...form, businessName: e.target.value })}
          />
        </div>

        <div className={styles.field}>
          <label>GSTIN</label>
          <input
            value={form.companyGstin || ""}
            onChange={e => setForm({ ...form, companyGstin: e.target.value })}
          />
        </div>

        <div className={styles.field}>
          <label>Company Address</label>
          <textarea
            rows={3}
            value={form.companyAddress || ""}
            onChange={e =>
              setForm({ ...form, companyAddress: e.target.value })
            }
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>State</label>
            <input
              value={form.companyState || ""}
              onChange={e =>
                setForm({ ...form, companyState: e.target.value })
              }
            />
          </div>

          <div className={styles.field}>
            <label>State Code</label>
            <input
              value={form.companyStateCode || ""}
              onChange={e =>
                setForm({ ...form, companyStateCode: e.target.value })
              }
            />
          </div>
        </div>

        <button
          onClick={save}
          disabled={loading}
          className={styles.button}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
