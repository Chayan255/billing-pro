import { Role } from "@prisma/client";

export function requireRole(
  role: Role,
  allowed: Role[]
) {
  if (!allowed.includes(role)) {
    throw new Error("Unauthorized");
  }
}
