import { redirect } from "next/navigation";

import { requireSession } from "@/lib/session";
import { isAdminRole } from "@/lib/roles";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  if (!isAdminRole(session.user.role)) redirect("/dashboard");

  return children;
}
