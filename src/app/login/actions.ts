"use server";

import { sql } from "drizzle-orm";
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

async function getAuthErrorMessage(error: unknown): Promise<string> {
  if (error instanceof Response) {
    try {
      const data = await error.json();
      const msg = typeof data?.message === "string" ? data.message : "";
      return msg || `Request failed (${error.status})`;
    } catch {
      return `Request failed (${error.status})`;
    }
  }

  if (error && typeof error === "object" && "message" in error) {
    const msg = (error as { message?: unknown }).message;
    if (typeof msg === "string" && msg.trim()) return msg;
  }

  return "Request failed.";
}

export async function loginAction(prevState: { error?: string } | undefined, formData: FormData) {
  const username = String(formData.get("username") ?? "")
    .trim()
    .toLowerCase();
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
      } catch (e) {
        const message = await getAuthErrorMessage(e);

        // Better Auth uses stable error codes; provide a clearer UX for the
        // common bootstrap case (e.g. passwords shorter than the default min).
        if (message.includes("PASSWORD_TOO_SHORT")) {
          return { error: "Password is too short (min 8 characters)." };
        }

        return { error: `Unable to create initial admin user: ${message}` };
      }
    }

    return { error: "Invalid username or password." };
  }
}
