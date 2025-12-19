import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const rebrickableSet = sqliteTable("rebrickable_set", {
  setNum: text("setNum").primaryKey().notNull(),
  name: text("name").notNull(),
  year: integer("year").notNull(),
  imageUrl: text("imageUrl"),
  lastFetchedAt: integer("lastFetchedAt", { mode: "timestamp_ms" }).notNull(),
  rawJson: text("rawJson"),
});

export const legoList = sqliteTable(
  "lego_list",
  {
    id: text("id").primaryKey().notNull(),
    ownerUserId: text("ownerUserId").notNull(),
    name: text("name").notNull(),
    createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [uniqueIndex("lego_list_owner_name_unique").on(t.ownerUserId, t.name)],
);

export const legoListSet = sqliteTable(
  "lego_list_set",
  {
    listId: text("listId").notNull(),
    setNum: text("setNum").notNull(),
    addedAt: integer("addedAt", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [uniqueIndex("lego_list_set_unique").on(t.listId, t.setNum)],
);

export const legoListViewer = sqliteTable(
  "lego_list_viewer",
  {
    listId: text("listId").notNull(),
    viewerUserId: text("viewerUserId").notNull(),
    addedAt: integer("addedAt", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [uniqueIndex("lego_list_viewer_unique").on(t.listId, t.viewerUserId)],
);
