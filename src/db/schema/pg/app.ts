import { doublePrecision, integer, text, timestamp, uniqueIndex, pgTable } from "drizzle-orm/pg-core";

export const rebrickableSet = pgTable("rebrickable_set", {
  setNum: text("setNum").primaryKey().notNull(),
  name: text("name").notNull(),
  year: integer("year").notNull(),
  imageUrl: text("imageUrl"),
  lastFetchedAt: timestamp("lastFetchedAt", { mode: "date" }).notNull(),
  rawJson: text("rawJson"),
});

export const bricksetPriceCache = pgTable("brickset_price_cache", {
  setNum: text("setNum").primaryKey().notNull(),
  rrpEur: doublePrecision("rrpEur"),
  lastFetchedAt: timestamp("lastFetchedAt", { mode: "date" }).notNull(),
  rawJson: text("rawJson"),
});

export const legoList = pgTable(
  "lego_list",
  {
    id: text("id").primaryKey().notNull(),
    ownerUserId: text("ownerUserId").notNull(),
    name: text("name").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull(),
  },
  (t) => [uniqueIndex("lego_list_owner_name_unique").on(t.ownerUserId, t.name)],
);

export const legoListSet = pgTable(
  "lego_list_set",
  {
    listId: text("listId").notNull(),
    setNum: text("setNum").notNull(),
    addedAt: timestamp("addedAt", { mode: "date" }).notNull(),
  },
  (t) => [uniqueIndex("lego_list_set_unique").on(t.listId, t.setNum)],
);

export const legoListViewer = pgTable(
  "lego_list_viewer",
  {
    listId: text("listId").notNull(),
    viewerUserId: text("viewerUserId").notNull(),
    addedAt: timestamp("addedAt", { mode: "date" }).notNull(),
  },
  (t) => [uniqueIndex("lego_list_viewer_unique").on(t.listId, t.viewerUserId)],
);
