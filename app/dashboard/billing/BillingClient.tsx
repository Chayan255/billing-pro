"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  discount: number;
};

export default function BillingClient({
  products,
}: {
  products: Product[];
}) {
  const router = useRouter();

  /* ================= CUSTOMER ================= */
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [customerGstin, setCustomerGstin] = useState("");


  /* ================= UI ================= */
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [gstPercent, setGstPercent] = useState(18);
  const [paymentMethod, setPaymentMethod] =
    useState<"CASH" | "UPI" | "CARD">("CASH");

  const [roundOff, setRoundOff] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ================= LOAD CART ================= */
  const loadCart = async () => {
    const res = await fetch("/api/cart");
    const data = await res.json();
    setCart(
      (data.cart || []).map((i: any) => ({
        product: i.product,
        qty: i.quantity,
        discount: i.discount ?? 0,
      }))
    );
  };

  useEffect(() => {
    loadCart();
  }, []);

  /* ================= KEYBOARD SHORTCUTS ================= */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        createInvoice();
      }
      if (e.key === "Escape") {
        resetInvoice();
      }
    };

    window.addEventListener("keydown", handler);
    return () =>
      window.removeEventListener("keydown", handler);
  }, [cart, customerName, mobile, gstPercent, paymentMethod]);

  /* ================= SEARCH ================= */
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  /* ================= CART ACTIONS ================= */
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
    loadCart();
  };

  const updateQty = async (id: number, qty: number) => {
    if (qty < 1) return;

    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: id,
        quantity: qty, // ✅ absolute qty
      }),
    });

    const data = await res.json();
    if (!res.ok) return setError(data.message);
    loadCart();
  };

  const updateDiscount = async (
    id: number,
    discount: number
  ) => {
    if (discount < 0) return;

    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: id,
        discount,
      }),
    });

    loadCart();
  };

  const removeItem = async (id: number) => {
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: id,
        quantity: 0,
      }),
    });

    loadCart();
  };

  const resetInvoice = () => {
    setCart([]);
    setCustomerName("");
    setMobile("");
    setRoundOff(0);
    setError(null);
  };

  /* ================= CALCULATION ================= */
  const taxable = cart.reduce(
    (sum, i) =>
      sum +
      i.product.price * i.qty -
      i.discount,
    0
  );

  const gstAmount = (taxable * gstPercent) / 100;
  const grossTotal = taxable + gstAmount;
  const finalTotal = grossTotal + roundOff;

  /* ================= CREATE INVOICE ================= */
  const createInvoice = async () => {
    if (cart.length === 0) {
      setError("Cart is empty");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await fetch("/api/bill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
   body: JSON.stringify({
  customerName,
  customerMobile: mobile || null,
  customerGstin: customerGstin || null,
  gstPercent,
  paymentMethod,
  roundOff,
}),

    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Failed to create invoice");
      setLoading(false);
      return;
    }

    router.push(`/dashboard/invoice/${data.bill.id}`);
  };

  /* ================= UI ================= */
  return (
    <div className={styles.layout}>
      {/* ================= LEFT ================= */}
      <div className={styles.products}>
        <h2>Products</h2>

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
              <div>
                <strong>{p.name}</strong>
                <div className={styles.stock}>
                  Stock:{" "}
                  <span
                    className={
                      p.stock <= 5 ? styles.lowStock : ""
                    }
                  >
                    {p.stock}
                  </span>
                </div>
              </div>
              <span>₹{p.price}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ================= RIGHT ================= */}
      <div className={styles.summary}>
        <h3>Invoice</h3>

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
      <input
  placeholder="Customer GSTIN (optional)"
  value={customerGstin}
  onChange={(e) => setCustomerGstin(e.target.value)}
/>

        {/* Payment Method */}
        <select
          value={paymentMethod}
          onChange={(e) =>
            setPaymentMethod(
              e.target.value as "CASH" | "UPI" | "CARD"
            )
          }
        >
          <option value="CASH">Cash</option>
          <option value="UPI">UPI</option>
          <option value="CARD">Card</option>
        </select>

        {error && (
          <div className={styles.error}>{error}</div>
        )}

        {/* ================= CART ================= */}
       {cart.map((i) => (
  <div key={i.product.id} className={styles.cartRow}>
    <span className={styles.itemName}>
      {i.product.name}
    </span>

    {/* Qty */}
    <div className={styles.qtyBox}>
      <button
        disabled={i.qty === 1}
        onClick={() =>
          updateQty(i.product.id, i.qty - 1)
        }
      >
        −
      </button>

      <input
        className={styles.qtyInput}
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

      <button
        onClick={() =>
          updateQty(i.product.id, i.qty + 1)
        }
      >
        +
      </button>
    </div>

    {/* 🔥 PER ITEM DISCOUNT */}
    <div className={styles.discountBox}>
      <span className={styles.currency}>₹</span>
      <input
        className={styles.discountInput}
        type="number"
        min={0}
        value={i.discount}
        onChange={(e) =>
          updateDiscount(
            i.product.id,
            Number(e.target.value)
          )
        }
      />
    </div>

    {/* Amount */}
    <span className={styles.amount}>
      ₹
      {(
        i.product.price * i.qty -
        i.discount
      ).toFixed(2)}
    </span>

    <button
      className={styles.removeBtn}
      onClick={() => removeItem(i.product.id)}
    >
      ✖
    </button>
  </div>
))}


        <hr />

        {/* GST */}
        <div className={styles.row}>
          <span>GST %</span>
          <select
            value={gstPercent}
            onChange={(e) =>
              setGstPercent(Number(e.target.value))
            }
          >
            {[0, 5, 12, 18, 28].map((g) => (
              <option key={g} value={g}>
                {g}%
              </option>
            ))}
          </select>
        </div>

        {/* Round Off */}
        <div className={styles.row}>
          <span>Round Off</span>
          <input
            className={styles.roundOffInput}
            type="number"
            step="0.01"
            value={roundOff}
            onChange={(e) =>
              setRoundOff(Number(e.target.value))
            }
          />
        </div>

        <div className={styles.row}>
          <span>Taxable</span>
          <span>₹{taxable.toFixed(2)}</span>
        </div>
        <div className={styles.row}>
          <span>GST</span>
          <span>₹{gstAmount.toFixed(2)}</span>
        </div>

        <div className={styles.total}>
          <strong>Total</strong>
          <strong>₹{finalTotal.toFixed(2)}</strong>
        </div>

        <button
          className={styles.resetBtn}
          onClick={resetInvoice}
        >
          Reset (Esc)
        </button>

        <button
          className={styles.createBtn}
          onClick={createInvoice}
          disabled={loading}
        >
          {loading
            ? "Creating..."
            : "Create Invoice (F2)"}
        </button>
      </div>
    </div>
  );
}
