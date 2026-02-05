import { redirect } from "next/navigation";

export function requireRole(
  role: string,
  allowed: Array<"ADMIN" | "STAFF" | "CASHIER">
) {
  if (!allowed.includes(role as any)) {
    redirect("/dashboard"); // বা 403 page
  }
}
