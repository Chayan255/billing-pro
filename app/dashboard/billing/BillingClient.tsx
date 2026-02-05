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
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [loading, setLoading] = useState(false);

  /* =====================
     Load cart from DB
  ===================== */
  useEffect(() => {
    fetch("/api/cart")
      .then((res) => res.json())
      .then((data) => {
        setCart(
          (data.cart || []).map((i: any) => ({
            product: i.product,
            qty: i.quantity,
          }))
        );
      });
  }, []);

  /* =====================
     Filter products
  ===================== */
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  /* =====================
     Add to cart (DB)
  ===================== */
  const addToCart = async (product: Product) => {
    if (product.stock === 0) return;

    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product.id,
        quantity: 1,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    setCart(
      data.cart.map((i: any) => ({
        product: i.product,
        qty: i.quantity,
      }))
    );
  };

  /* =====================
     Update quantity (DB)
  ===================== */
  const updateQty = async (productId: number, qty: number) => {
    if (qty <= 0) return;

    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        quantity: qty,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    setCart(
      data.cart.map((i: any) => ({
        product: i.product,
        qty: i.quantity,
      }))
    );
  };

  /* =====================
     Remove item (set qty = 0)
  ===================== */
  const removeItem = async (productId: number) => {
    // easiest: reset cart by refetch
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        quantity: 0,
      }),
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

  /* =====================
     Calculations
  ===================== */
  const taxable = cart.reduce(
    (sum, i) => sum + i.product.price * i.qty,
    0
  );
  const cgst = taxable * 0.09;
  const sgst = taxable * 0.09;
  const total = taxable + cgst + sgst;

  /* =====================
     Create Invoice
  ===================== */
  const createInvoice = async () => {
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/bill", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to create invoice");
        setLoading(false);
        return;
      }

      // 🔥 redirect to invoice view
      window.location.href = `/dashboard/invoice/${data.bill.id}`;
    } catch {
      alert("Failed to create invoice");
      setLoading(false);
    }
  };

  return (
    <div className={styles.layout}>
      {/* LEFT */}
      <div className={styles.products}>
        <h2>Create Invoice</h2>

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
              <small>Stock: {p.stock}</small>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT */}
      <div className={styles.summary}>
        <h3>Invoice Summary</h3>

        {cart.length === 0 && <p>No items</p>}

        {cart.map((i) => (
          <div key={i.product.id} className={styles.cartRow}>
            <span>{i.product.name}</span>

            <input
              type="number"
              min={1}
              value={i.qty}
              onChange={(e) =>
                updateQty(
                  i.product.id,
                  Number(e.target.value)
                )
              }
            />

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
          <span>CGST (9%)</span>
          <span>₹{cgst.toFixed(2)}</span>
        </div>
        <div className={styles.row}>
          <span>SGST (9%)</span>
          <span>₹{sgst.toFixed(2)}</span>
        </div>

        <div className={styles.total}>
          <strong>Total</strong>
          <strong>₹{total.toFixed(2)}</strong>
        </div>

        <select
          value={paymentMethod}
          onChange={(e) =>
            setPaymentMethod(e.target.value)
          }
        >
          <option value="CASH">Cash</option>
          <option value="UPI">UPI</option>
          <option value="CARD">Card</option>
        </select>

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
