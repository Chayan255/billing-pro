"use client";

export default function InvoicePrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="px-4 py-2 bg-black text-white rounded"
    >
      🖨️ Print Invoice
    </button>
  );
}
