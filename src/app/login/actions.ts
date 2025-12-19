"use server";

import { and, eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { authUser } from "@/db/schema";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

function usernameToEmail(username: string) {
  return `${username}@local.invalid`;
}

async function hasAnyUsers() {
  const rows = await db.select({ count: sql<number>`count(*)` }).from(authUser);
  return (rows[0]?.count ?? 0) > 0;
}

export async function loginAction(prevState: { error?: string } | undefined, formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Username and password are required." };
  }

  try {
    await auth.api.signInUsername({
      body: { username, password },
      headers: await headers(),
    });
    redirect("/dashboard");
  } catch {
    // Bootstrap: if this is a fresh DB, allow the first login attempt to create
    // the first user. The auth config promotes the first user to admin.
    if (!(await hasAnyUsers())) {
      try {
        await auth.api.signUpEmail({
          body: {
            name: username,
            email: usernameToEmail(username),
            password,
            username,
            displayUsername: username,
          },
          headers: await headers(),
        });
        redirect("/dashboard");
      } catch {
        return { error: "Unable to create initial admin user." };
      }
    }

    return { error: "Invalid username or password." };
  }
}
