import { ReactNode } from "react";

import ClientShell from "./client-shell";
import { getAuthUser } from "@/lib/auth";




export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // 🔒 Server-side auth guard
  await getAuthUser();

  return <ClientShell>{children}</ClientShell>;
}
