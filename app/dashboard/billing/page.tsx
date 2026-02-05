import { prisma } from "@/lib/db";
import BillingClient from "./BillingClient";


export default async function BillingPage() {
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
  });

  return <BillingClient products={products} />;
}
