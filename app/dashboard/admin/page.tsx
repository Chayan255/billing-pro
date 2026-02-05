import { getAuthUser } from "@/lib/get-auth-user";
import { requireRole } from "@/lib/role-guard";

export default async function AdminPage() {
  const user = await getAuthUser(); // ✅ auth + redirect handled

  // Only ADMIN allowed
  requireRole(user.role, ["ADMIN"]);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Admin Panel</h1>
      <p>Only ADMIN can see this page.</p>
    </div>
  );
}
