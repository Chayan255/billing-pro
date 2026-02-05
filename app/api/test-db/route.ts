import { prisma } from "@/lib/db";

export async function GET() {
  const products = await prisma.product.findMany();
  return Response.json(products);
}
