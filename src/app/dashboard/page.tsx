import Link from "next/link";

import { db } from "@/db";
import { legoList, legoListViewer } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { eq } from "drizzle-orm";
import { createListAction } from "@/app/dashboard/actions";

export default async function DashboardPage() {
  const session = await requireSession();

  const ownedLists = await db
    .select({ id: legoList.id, name: legoList.name })
    .from(legoList)
    .where(eq(legoList.ownerUserId, session.user.id))
    .orderBy(legoList.name);

  const sharedLists = await db
    .select({ id: legoList.id, name: legoList.name, ownerUserId: legoList.ownerUserId })
    .from(legoListViewer)
    .innerJoin(legoList, eq(legoListViewer.listId, legoList.id))
    .where(eq(legoListViewer.viewerUserId, session.user.id))
    .orderBy(legoList.name);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-sm opacity-80">
            Signed in as <span className="font-medium">{session.user.name}</span>
          </p>
        </div>

        <Link
          href="/sets/search"
          className="rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/15"
        >
          Search sets
        </Link>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Your lists</h2>

        <form action={createListAction} className="mt-3 flex gap-2">
          <input
            name="name"
            placeholder="New list name"
            className="w-full max-w-sm rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/15"
          />
          <button
            type="submit"
            className="rounded-md bg-black px-3 py-2 text-sm text-white dark:bg-white dark:text-black"
          >
            Create
          </button>
        </form>

        {ownedLists.length === 0 ? (
          <p className="mt-3 text-sm opacity-70">No lists yet.</p>
        ) : (
          <ul className="mt-4 grid gap-2">
            {ownedLists.map((l) => (
              <li key={l.id}>
                <Link
                  href={`/lists/${l.id}`}
                  className="block rounded-md border border-black/10 px-3 py-2 hover:underline dark:border-white/15"
                >
                  {l.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Shared with you</h2>
        {sharedLists.length === 0 ? (
          <p className="mt-3 text-sm opacity-70">No shared lists.</p>
        ) : (
          <ul className="mt-4 grid gap-2">
            {sharedLists.map((l) => (
              <li key={l.id}>
                <Link
                  href={`/lists/${l.id}`}
                  className="block rounded-md border border-black/10 px-3 py-2 hover:underline dark:border-white/15"
                >
                  {l.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
