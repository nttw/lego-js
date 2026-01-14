"use server";

import { db } from "@/db";
import { rebrickableSet } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { isAdminRole } from "@/lib/roles";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const session = await requireSession();
  if (!isAdminRole(session.user.role)) redirect("/dashboard");
  return session;
}

export async function deleteCachedSetImageAction(setNum: string) {
  await requireAdmin();
  const normalized = String(setNum ?? "").trim();
  if (!normalized) redirect("/admin/cache");

  await db.update(rebrickableSet).set({ imageUrl: null }).where(eq(rebrickableSet.setNum, normalized));

  redirect("/admin/cache");
}
