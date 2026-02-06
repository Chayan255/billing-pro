import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import BillingClient from "./BillingClient";

export default async function BillingPage() {
  const user = await getAuthUser(); // 🔐 logged-in user

  const products = await prisma.product.findMany({
    where: {
      ownerId: user.id, // ✅ ONLY this user's products
    },
    orderBy: { name: "asc" },
  });

  return <BillingClient products={products} />;
}
