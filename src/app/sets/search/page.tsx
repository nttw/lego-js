import Image from "next/image";
import Link from "next/link";

import { db } from "@/db";
import { legoList } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { eq } from "drizzle-orm";
import { searchAndCacheSets } from "@/lib/rebrickable-cache";
import { addSetToListsAction } from "@/app/sets/search/actions";
import type { RebrickableSet } from "@/lib/rebrickable";

export default async function SearchSetsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await requireSession();
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const lists = await db
    .select({ id: legoList.id, name: legoList.name })
    .from(legoList)
    .where(eq(legoList.ownerUserId, session.user.id))
    .orderBy(legoList.name);

  const results = query
    ? await safeSearch(query)
    : ({ data: [] as RebrickableSet[], error: null as string | null } satisfies {
        data: RebrickableSet[];
        error: string | null;
      });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div>
        <p className="text-sm opacity-70">
          <Link href="/dashboard" className="hover:underline">
            Dashboard
          </Link>
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Search sets</h1>
        <p className="mt-1 text-sm opacity-80">
          Search by set name or set number, then add to one or more lists.
        </p>
      </div>

      <form method="get" className="mt-6 flex gap-2">
        <input
          name="q"
          defaultValue={query}
          placeholder="e.g. 42115 or Lambo"
          className="w-full max-w-xl rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/15"
        />
        <button
          type="submit"
          className="rounded-md bg-black px-3 py-2 text-sm text-white dark:bg-white dark:text-black"
        >
          Search
        </button>
      </form>

      {query && results.error ? (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">
          {results.error}
        </p>
      ) : null}

      {query && !results.error ? (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Results</h2>

          {results.data.length === 0 ? (
            <p className="mt-3 text-sm opacity-70">No matches.</p>
          ) : (
            <ul className="mt-4 grid gap-3">
              {results.data.map((s) => (
                <li
                  key={s.set_num}
                  className="rounded-md border border-black/10 p-3 dark:border-white/15"
                >
                  <div className="flex items-start gap-3">
                    {s.set_img_url ? (
                      <Image
                        src={s.set_img_url}
                        alt={s.name}
                        width={80}
                        height={80}
                        className="h-20 w-20 rounded object-cover"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded bg-black/5 dark:bg-white/10" />
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{s.name}</div>
                      <div className="text-sm opacity-80">
                        {s.set_num} • {s.year}
                      </div>

                      {lists.length === 0 ? (
                        <p className="mt-3 text-sm opacity-70">
                          Create a list first on the dashboard.
                        </p>
                      ) : (
                        <form action={addSetToListsAction} className="mt-3">
                          <input type="hidden" name="setNum" value={s.set_num} />
                          <input type="hidden" name="q" value={query} />

                          <div className="flex flex-wrap gap-3">
                            {lists.map((l) => (
                              <label key={l.id} className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  name="listId"
                                  value={l.id}
                                  className="h-4 w-4"
                                />
                                <span>{l.name}</span>
                              </label>
                            ))}
                          </div>

                          <button
                            type="submit"
                            className="mt-3 rounded-md border border-black/10 px-3 py-1 text-sm dark:border-white/15"
                          >
                            Add to selected lists
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </main>
  );
}

async function safeSearch(query: string) {
  try {
    const data = await searchAndCacheSets(query);
    return { data, error: null as string | null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Search failed.";
    return { data: [], error: msg };
  }
}
