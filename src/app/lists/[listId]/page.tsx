import Image from "next/image";
import { notFound } from "next/navigation";

import { db } from "@/db";
import {
  authUser,
  legoList,
  legoListSet,
  legoListViewer,
  rebrickableSet,
} from "@/db/schema";
import { requireSession } from "@/lib/session";
import { and, eq } from "drizzle-orm";
import Link from "next/link";
import {
  addViewerAction,
  removeSetFromListAction,
  removeViewerAction,
  renameListAction,
} from "@/app/lists/[listId]/actions";

export default async function ListPage({
  params,
}: {
  params: Promise<{ listId: string }>;
}) {
  const session = await requireSession();
  const { listId } = await params;

  const listRows = await db
    .select({ id: legoList.id, name: legoList.name, ownerUserId: legoList.ownerUserId })
    .from(legoList)
    .where(eq(legoList.id, listId))
    .limit(1);

  const list = listRows[0];
  if (!list) notFound();

  const isOwner = list.ownerUserId === session.user.id;

  if (!isOwner) {
    const viewer = await db
      .select({ listId: legoListViewer.listId })
      .from(legoListViewer)
      .where(and(eq(legoListViewer.listId, listId), eq(legoListViewer.viewerUserId, session.user.id)))
      .limit(1);

    if (!viewer[0]) notFound();
  }

  const sets = await db
    .select({
      setNum: legoListSet.setNum,
      name: rebrickableSet.name,
      year: rebrickableSet.year,
      imageUrl: rebrickableSet.imageUrl,
    })
    .from(legoListSet)
    .leftJoin(rebrickableSet, eq(legoListSet.setNum, rebrickableSet.setNum))
    .where(eq(legoListSet.listId, listId))
    .orderBy(legoListSet.addedAt);

  const viewers = isOwner
    ? await db
        .select({ id: authUser.id, username: authUser.username, name: authUser.name })
        .from(legoListViewer)
        .innerJoin(authUser, eq(legoListViewer.viewerUserId, authUser.id))
        .where(eq(legoListViewer.listId, listId))
        .orderBy(authUser.username)
    : [];

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm opacity-70">
            <Link href="/dashboard" className="hover:underline">
              Dashboard
            </Link>
          </p>
          <h1 className="mt-1 text-2xl font-semibold">{list.name}</h1>
          {!isOwner ? (
            <p className="mt-1 text-sm opacity-80">View-only (shared with you)</p>
          ) : null}
        </div>

        <Link
          href="/sets/search"
          className="rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/15"
        >
          Add sets
        </Link>
      </div>

      {isOwner ? (
        <section className="mt-6 rounded-md border border-black/10 p-4 dark:border-white/15">
          <h2 className="text-sm font-semibold">Rename list</h2>
          <form action={renameListAction.bind(null, listId)} className="mt-2 flex gap-2">
            <input
              name="name"
              defaultValue={list.name}
              className="w-full max-w-sm rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/15"
            />
            <button
              type="submit"
              className="rounded-md bg-black px-3 py-2 text-sm text-white dark:bg-white dark:text-black"
            >
              Save
            </button>
          </form>
        </section>
      ) : null}

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Sets</h2>
        {sets.length === 0 ? (
          <p className="mt-3 text-sm opacity-70">No sets in this list.</p>
        ) : (
          <ul className="mt-4 grid gap-3">
            {sets.map((s) => (
              <li
                key={s.setNum}
                className="flex items-center justify-between gap-4 rounded-md border border-black/10 p-3 dark:border-white/15"
              >
                <div className="flex items-center gap-3">
                  {s.imageUrl ? (
                    <Image
                      src={s.imageUrl}
                      alt={s.name ?? s.setNum}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded bg-black/5 dark:bg-white/10" />
                  )}

                  <div>
                    <div className="font-medium">{s.name ?? s.setNum}</div>
                    <div className="text-sm opacity-80">
                      {s.setNum}
                      {typeof s.year === "number" ? ` • ${s.year}` : ""}
                    </div>
                  </div>
                </div>

                {isOwner ? (
                  <form action={removeSetFromListAction.bind(null, listId, s.setNum)}>
                    <button
                      type="submit"
                      className="rounded-md border border-black/10 px-3 py-1 text-sm dark:border-white/15"
                    >
                      Remove
                    </button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {isOwner ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">Sharing</h2>

          <form action={addViewerAction.bind(null, listId)} className="mt-3 flex gap-2">
            <input
              name="username"
              placeholder="Username to share with"
              className="w-full max-w-sm rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/15"
            />
            <button
              type="submit"
              className="rounded-md bg-black px-3 py-2 text-sm text-white dark:bg-white dark:text-black"
            >
              Add viewer
            </button>
          </form>

          {viewers.length === 0 ? (
            <p className="mt-3 text-sm opacity-70">No viewers yet.</p>
          ) : (
            <ul className="mt-4 grid gap-2">
              {viewers.map((v) => (
                <li
                  key={v.id}
                  className="flex items-center justify-between rounded-md border border-black/10 px-3 py-2 dark:border-white/15"
                >
                  <div>
                    <div className="text-sm font-medium">{v.username ?? v.name}</div>
                    <div className="text-xs opacity-70">{v.name}</div>
                  </div>
                  <form action={removeViewerAction.bind(null, listId, v.id)}>
                    <button
                      type="submit"
                      className="rounded-md border border-black/10 px-3 py-1 text-sm dark:border-white/15"
                    >
                      Remove
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </main>
  );
}
