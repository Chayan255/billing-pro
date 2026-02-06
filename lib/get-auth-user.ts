import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";

// Force Node runtime (good for crypto / jwt)
export const runtime = "nodejs";

export async function getAuthUser() {
  // ✅ Next 15 / 16: cookies() is async
  const cookieStore = await cookies();

  const rawToken = cookieStore.get("token")?.value;

  // ❌ No token → block
  if (!rawToken) {
    redirect("/login");
  }

  // ✅ Strip Bearer prefix if present
  const token = rawToken.startsWith("Bearer ")
    ? rawToken.slice(7)
    : rawToken;

  // ⚠️ verifyToken MUST be server-safe
  const user = await verifyToken(token);

  // ❌ Invalid / expired token → block
  if (!user) {
    redirect("/login");
  }

  return user;
}
