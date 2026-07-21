import { getDb } from "@/db";
import { rebrickableSet } from "@/db/schema";
import { rebrickableClient, type RebrickableSet } from "@/lib/rebrickable";
import { sql } from "drizzle-orm";

// D1 allows at most 100 bound parameters per statement. Each inserted set uses
// six parameters and the conflict update uses one more for lastFetchedAt.
const MAX_SETS_PER_UPSERT = 16;

export async function searchAndCacheSets(query: string): Promise<RebrickableSet[]> {
  const db = await getDb();
  const client = rebrickableClient();

  const response = await client.getSets({
    search: query,
    ordering: "name",
    pageSize: 20,
  });

  const now = new Date();
  const results = (response?.results ?? []) as RebrickableSet[];

  if (results.length === 0) return [];

  const cacheable = results.filter(
    (s) => typeof s.set_num === "string" && !!s.name && typeof s.year === "number",
  ) as Array<RebrickableSet & { year: number }>;

  if (cacheable.length === 0) return results;

  for (let start = 0; start < cacheable.length; start += MAX_SETS_PER_UPSERT) {
    const batch = cacheable.slice(start, start + MAX_SETS_PER_UPSERT);

    await db
      .insert(rebrickableSet)
      .values(
        batch.map((s) => ({
          setNum: s.set_num,
          name: s.name,
          year: s.year,
          imageUrl: s.set_img_url || null,
          lastFetchedAt: now,
          rawJson: JSON.stringify(s),
        })),
      )
      .onConflictDoUpdate({
        target: rebrickableSet.setNum,
        set: {
          name: sql`excluded.name`,
          year: sql`excluded.year`,
          imageUrl: sql`excluded."imageUrl"`,
          lastFetchedAt: now,
          rawJson: sql`excluded."rawJson"`,
        },
      });
  }

  return results;
}
