import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";

// jsonwebtoken Node runtime এ safe
export const runtime = "nodejs";

export async function getAuthUser() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get("token")?.value;
  

  if (!rawToken) {
    redirect("/login");
  }

  // Bearer থাকলে কেটে ফেলছি
  const token = rawToken.startsWith("Bearer ")
    ? rawToken.slice(7)
    : rawToken;

  const user = verifyToken(token);

  // token invalid / expired হলে logout
  if (!user) {
    redirect("/login");
  }

  return user;
}
