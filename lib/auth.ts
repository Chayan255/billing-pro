import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";

export const runtime = "nodejs";

export async function getAuthUser() {
  // ✅ Next 15/16: cookies() is async
  const cookieStore = await cookies();
  const rawToken = cookieStore.get("token")?.value;

  if (!rawToken) {
    redirect("/login");
  }

  const token = rawToken.startsWith("Bearer ")
    ? rawToken.slice(7)
    : rawToken;

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) {
    redirect("/login");
  }

  return user; // ✅ fully typed Prisma User
}