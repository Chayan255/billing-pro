"use client";

import { useEffect, useState } from "react";
import styles from "./billing.module.css";

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
};

type CartItem = {
  product: Product;
  qty: number;
};

export default function BillingClient({
  products,
}: {
  products: Product[];
}) {
  /* ===== Customer ===== */
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");

  /* ===== UI ===== */
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* =====================
     Load cart
  ===================== */
  useEffect(() => {
    fetch("/api/cart")
      .then((res) => res.json())
      .then((data) =>
        setCart(
          (data.cart || []).map((i: any) => ({
            product: i.product,
            qty: i.quantity,
          }))
        )
      );
  }, []);

  /* =====================
     Search
  ===================== */
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  /* =====================
     Cart handlers
  ===================== */
  const addToCart = async (product: Product) => {
    setError(null);
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product.id,
        quantity: 1,
      }),
    });

    const data = await res.json();
    if (!res.ok) return setError(data.message);

    setCart(
      data.cart.map((i: any) => ({
        product: i.product,
        qty: i.quantity,
      }))
    );
  };

  const updateQty = async (id: number, qty: number) => {
    if (qty <= 0) return;
    setError(null);

    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: id, quantity: qty }),
    });

    const data = await res.json();
    if (!res.ok) return setError(data.message);

    setCart(
      data.cart.map((i: any) => ({
        product: i.product,
        qty: i.quantity,
      }))
    );
  };

  const removeItem = async (id: number) => {
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: id, quantity: 0 }),
    });

    const res = await fetch("/api/cart");
    const data = await res.json();
    setCart(
      data.cart.map((i: any) => ({
        product: i.product,
        qty: i.quantity,
      }))
    );
  };

  const resetInvoice = async () => {
    setCart([]);
    setCustomerName("");
    setMobile("");
    setError(null);
  };

  /* =====================
     Calculation
  ===================== */
  const taxable = cart.reduce(
    (sum, i) => sum + i.product.price * i.qty,
    0
  );
  const gst = taxable * 0.18;
  const total = taxable + gst;

  /* =====================
     Create invoice
  ===================== */
const createInvoice = async () => {
  if (cart.length === 0) {
    setError("Cart is empty");
    return;
  }

  setLoading(true);
  setError(null);

  const res = await fetch("/api/bill", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customerName,
      customerMobile: mobile || null,
      paymentMethod: "CASH",
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    setError(data.message || "Failed to create invoice");
    setLoading(false);
    return;
  }

  // ✅ redirect to invoice view
  window.location.href = `/dashboard/invoice/${data.bill.id}`;
};

  return (
    <div className={styles.layout}>
      {/* LEFT */}
      <div className={styles.products}>
        <h2>Add Products</h2>

        <input
          className={styles.search}
          placeholder="Search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className={styles.productList}>
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className={styles.product}
              onClick={() => addToCart(p)}
            >
              <span>{p.name}</span>
              <span>₹{p.price}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT – INVOICE PREVIEW */}
      <div className={styles.summary}>
        <h3>Invoice</h3>

        {/* Company */}
        <div className={styles.company}>
          <strong>Billing Pro</strong>
          <small>GSTIN: 22AAAAA0000A1Z5</small>
        </div>

        {/* Customer */}
        <input
          placeholder="Customer name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />
        <input
          placeholder="Mobile number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />

        {error && (
          <div className={styles.error}>{error}</div>
        )}

        {/* Items */}
        {cart.map((i) => (
          <div key={i.product.id} className={styles.cartRow}>
            <span>{i.product.name}</span>

            <div className={styles.qtyBox}>
              <button
                onClick={() =>
                  updateQty(i.product.id, i.qty - 1)
                }
              >
                −
              </button>
              <span>{i.qty}</span>
              <button
                onClick={() =>
                  updateQty(i.product.id, i.qty + 1)
                }
              >
                +
              </button>
            </div>

            <span>
              ₹{i.product.price * i.qty}
            </span>

            <button
              onClick={() =>
                removeItem(i.product.id)
              }
            >
              ✖
            </button>
          </div>
        ))}

        <hr />

        <div className={styles.row}>
          <span>Taxable</span>
          <span>₹{taxable.toFixed(2)}</span>
        </div>
        <div className={styles.row}>
          <span>GST (18%)</span>
          <span>₹{gst.toFixed(2)}</span>
        </div>

        <div className={styles.total}>
          <strong>Total</strong>
          <strong>₹{total.toFixed(2)}</strong>
        </div>

        <button
          className={styles.resetBtn}
          onClick={resetInvoice}
        >
          Reset
        </button>

        <button
          className={styles.createBtn}
          onClick={createInvoice}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Invoice"}
        </button>
      </div>
    </div>
  );
}
