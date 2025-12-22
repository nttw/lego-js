"use server";

import { db } from "@/db";
import { authUser, legoList, legoListSet, legoListViewer } from "@/db/schema";
import { bricksetClient } from "@/lib/brickset";
import { requireSession } from "@/lib/session";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function renameListAction(listId: string, formData: FormData) {
  const session = await requireSession();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect(`/lists/${listId}`);

  const list = await db
    .select({ ownerUserId: legoList.ownerUserId })
    .from(legoList)
    .where(eq(legoList.id, listId))
    .limit(1);

  if (list[0]?.ownerUserId !== session.user.id) redirect(`/lists/${listId}`);

  await db
    .update(legoList)
    .set({ name, updatedAt: new Date() })
    .where(eq(legoList.id, listId));

  redirect(`/lists/${listId}`);
}

export async function removeSetFromListAction(listId: string, setNum: string) {
  const session = await requireSession();

  const list = await db
    .select({ ownerUserId: legoList.ownerUserId })
    .from(legoList)
    .where(eq(legoList.id, listId))
    .limit(1);

  if (list[0]?.ownerUserId !== session.user.id) redirect(`/lists/${listId}`);

  await db
    .delete(legoListSet)
    .where(and(eq(legoListSet.listId, listId), eq(legoListSet.setNum, setNum)));

  redirect(`/lists/${listId}`);
}

export async function addViewerAction(listId: string, formData: FormData) {
  const session = await requireSession();
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  if (!username) redirect(`/lists/${listId}`);

  const list = await db
    .select({ ownerUserId: legoList.ownerUserId })
    .from(legoList)
    .where(eq(legoList.id, listId))
    .limit(1);

  if (list[0]?.ownerUserId !== session.user.id) redirect(`/lists/${listId}`);

  const user = await db
    .select({ id: authUser.id })
    .from(authUser)
    .where(eq(authUser.username, username))
    .limit(1);

  const viewerUserId = user[0]?.id;
  if (!viewerUserId) redirect(`/lists/${listId}`);

  if (viewerUserId === session.user.id) redirect(`/lists/${listId}`);

  await db
    .insert(legoListViewer)
    .values({ listId, viewerUserId, addedAt: new Date() })
    .onConflictDoNothing();

  redirect(`/lists/${listId}`);
}

export async function removeViewerAction(listId: string, viewerUserId: string) {
  const session = await requireSession();

  const list = await db
    .select({ ownerUserId: legoList.ownerUserId })
    .from(legoList)
    .where(eq(legoList.id, listId))
    .limit(1);

  if (list[0]?.ownerUserId !== session.user.id) redirect(`/lists/${listId}`);

  await db
    .delete(legoListViewer)
    .where(and(eq(legoListViewer.listId, listId), eq(legoListViewer.viewerUserId, viewerUserId)));

  redirect(`/lists/${listId}`);
}

export async function fetchSetRrpEurAction(
  listId: string,
  setNum: string,
): Promise<{ rrpEur: number | null }> {
  const session = await requireSession();

  const list = await db
    .select({ ownerUserId: legoList.ownerUserId })
    .from(legoList)
    .where(eq(legoList.id, listId))
    .limit(1);

  const isOwner = list[0]?.ownerUserId === session.user.id;
  if (!isOwner) {
    const viewer = await db
      .select({ listId: legoListViewer.listId })
      .from(legoListViewer)
      .where(and(eq(legoListViewer.listId, listId), eq(legoListViewer.viewerUserId, session.user.id)))
      .limit(1);

    if (!viewer[0]) throw new Error("Not authorized");
  }

  const normalized = String(setNum ?? "").trim();
  if (!normalized) return { rrpEur: null };

  try {
    const client = bricksetClient();
    const set = await client.getSet(normalized);
    const rrpEur = set?.LEGOCom?.DE?.retailPrice;
    return { rrpEur: typeof rrpEur === "number" ? rrpEur : null };
  } catch {
    return { rrpEur: null };
  }
}
