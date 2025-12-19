"use server";

import { db } from "@/db";
import { legoList, legoListSet } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { and, eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function addSetToListsAction(formData: FormData) {
  const session = await requireSession();
  const setNum = String(formData.get("setNum") ?? "").trim();
  const q = String(formData.get("q") ?? "").trim();

  const listIds = formData.getAll("listId").map(String).filter(Boolean);

  if (!setNum || listIds.length === 0) {
    redirect(q ? `/sets/search?q=${encodeURIComponent(q)}` : "/sets/search");
  }

  const owned = (await db
    .select({ id: legoList.id })
    .from(legoList)
    .where(and(eq(legoList.ownerUserId, session.user.id), inArray(legoList.id, listIds)))) as Array<{ id: string }>;

  const ownedIds = new Set(owned.map((l) => l.id));

  const now = new Date();
  const inserts = listIds
    .filter((id) => ownedIds.has(id))
    .map((listId) => ({ listId, setNum, addedAt: now }));

  if (inserts.length > 0) {
    await db.insert(legoListSet).values(inserts).onConflictDoNothing();
  }

  redirect(q ? `/sets/search?q=${encodeURIComponent(q)}` : "/sets/search");
}
