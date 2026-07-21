"use server";

import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function signOutAction() {
  const auth = await getAuth();
  await auth.api.signOut({
    headers: await headers(),
  });

  redirect("/login");
}
