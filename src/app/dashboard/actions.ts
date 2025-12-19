"use server";

import { db } from "@/db";
import { legoList } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { redirect } from "next/navigation";
import crypto from "node:crypto";

export async function createListAction(formData: FormData) {
  const session = await requireSession();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/dashboard");

  const now = new Date();
  const id = crypto.randomUUID();

  await db.insert(legoList).values({
    id,
    ownerUserId: session.user.id,
    name,
    createdAt: now,
    updatedAt: now,
  });

  redirect(`/lists/${id}`);
}
