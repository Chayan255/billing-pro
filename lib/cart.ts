type CartItem = {
  productId: number;
  quantity: number;
};

const carts = new Map<number, CartItem[]>();

export function getCart(userId: number) {
  return carts.get(userId) ?? [];
}

export function addToCart(
  userId: number,
  productId: number,
  quantity: number
) {
  const cart = carts.get(userId) ?? [];

  const existing = cart.find((i) => i.productId === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }

  carts.set(userId, cart);
}

export function clearCart(userId: number) {
  carts.delete(userId);
}
