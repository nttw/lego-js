import { db } from "@/db";
import { rebrickableSet } from "@/db/schema";
import { rebrickableClient, type RebrickableSet } from "@/lib/rebrickable";
import { sql } from "drizzle-orm";

export async function searchAndCacheSets(query: string): Promise<RebrickableSet[]> {
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

  await db
    .insert(rebrickableSet)
    .values(
      cacheable.map((s) => ({
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

  return results;
}
