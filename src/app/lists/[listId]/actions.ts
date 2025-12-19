"use server";

import { db } from "@/db";
import { authUser, legoList, legoListSet, legoListViewer } from "@/db/schema";
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
