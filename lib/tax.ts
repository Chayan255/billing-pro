export function calculateGST(
  amount: number,
  rate = 18
) {
  const taxableAmount = Number((amount / (1 + rate / 100)).toFixed(2));
  const tax = Number((amount - taxableAmount).toFixed(2));

  const cgst = Number((tax / 2).toFixed(2));
  const sgst = Number((tax / 2).toFixed(2));

  return {
    taxableAmount,
    cgst,
    sgst,
    igst: 0,
  };
}
