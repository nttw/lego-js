import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { rebrickableSet } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { isAdminRole } from "@/lib/roles";
import { deleteCachedSetImageAction } from "@/app/admin/cache/actions";

export default async function AdminCachePage() {
  const session = await requireSession();
  if (!isAdminRole(session.user.role)) redirect("/dashboard");

  const rows = (await db
    .select({
      setNum: rebrickableSet.setNum,
      name: rebrickableSet.name,
      year: rebrickableSet.year,
      imageUrl: rebrickableSet.imageUrl,
      lastFetchedAt: rebrickableSet.lastFetchedAt,
    })
    .from(rebrickableSet)
    .orderBy(rebrickableSet.lastFetchedAt)) as Array<{
    setNum: string;
    name: string;
    year: number;
    imageUrl: string | null;
    lastFetchedAt: Date | number;
  }>;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div>
        <p className="text-sm opacity-70">
          <Link href="/dashboard" className="hover:underline">
            Dashboard
          </Link>
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Cache</h1>
        <p className="mt-1 text-sm opacity-80">
          Admin view of cached Rebrickable set data. Deleting an image clears the cached image URL.
        </p>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Cached sets</h2>
        {rows.length === 0 ? (
          <p className="mt-3 text-sm opacity-70">No cached sets yet.</p>
        ) : (
          <ul className="mt-4 grid gap-3">
            {rows.map((s) => (
              <li
                key={s.setNum}
                className="flex items-center justify-between gap-4 rounded-md border border-black/20 p-3 dark:border-white/15"
              >
                <div className="flex items-center gap-3">
                  {s.imageUrl ? (
                    <Image
                      src={s.imageUrl}
                      alt={s.name}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded bg-black/5 dark:bg-white/10" />
                  )}

                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-sm opacity-80">
                      {s.setNum} • {s.year}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {s.imageUrl ? (
                    <form action={deleteCachedSetImageAction.bind(null, s.setNum)}>
                      <button
                        type="submit"
                        className="rounded-md border border-black/20 px-3 py-1 text-sm dark:border-white/15"
                      >
                        Delete image
                      </button>
                    </form>
                  ) : (
                    <span className="text-sm opacity-70">No image cached</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
