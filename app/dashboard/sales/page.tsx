

import { getAuthUser } from "@/lib/auth";
import { requireRole } from "@/lib/role-guard";

export default async function SalesPage() {
  const user = await getAuthUser(); // ✅ await

  requireRole(user.role, ["ADMIN", "STAFF"]);

  return <h1>Sales Page</h1>;
}
