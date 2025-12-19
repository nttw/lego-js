"use server";

import { auth } from "@/lib/auth";
import { requireSession } from "@/lib/session";
import { isAdminRole } from "@/lib/roles";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

function usernameToEmail(username: string) {
  return `${username}@local.invalid`;
}

function parseRole(value: unknown): "admin" | "user" {
  return value === "admin" ? "admin" : "user";
}

async function requireAdmin() {
  const session = await requireSession();
  if (!isAdminRole(session.user.role)) redirect("/dashboard");
  return session;
}

export async function createUserAction(formData: FormData) {
  await requireAdmin();

  const username = String(formData.get("username") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim() || username;
  const password = String(formData.get("password") ?? "");
  const role = parseRole(formData.get("role"));

  if (!username || !password) redirect("/admin/users");

  await auth.api.createUser({
    body: {
      email: usernameToEmail(username),
      password,
      name,
      role,
      data: {
        username,
        displayUsername: username,
      },
    },
    headers: await headers(),
  });

  redirect("/admin/users");
}

export async function setRoleAction(userId: string, formData: FormData) {
  await requireAdmin();
  const role = parseRole(formData.get("role"));

  await auth.api.setRole({
    body: { userId, role },
    headers: await headers(),
  });

  redirect("/admin/users");
}

export async function setPasswordAction(userId: string, formData: FormData) {
  await requireAdmin();
  const newPassword = String(formData.get("newPassword") ?? "");
  if (!newPassword) redirect("/admin/users");

  await auth.api.setUserPassword({
    body: { userId, newPassword },
    headers: await headers(),
  });

  redirect("/admin/users");
}

export async function updateNameAction(userId: string, formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/admin/users");

  await auth.api.adminUpdateUser({
    body: {
      userId,
      data: { name },
    },
    headers: await headers(),
  });

  redirect("/admin/users");
}

export async function deleteUserAction(userId: string) {
  await requireAdmin();

  await auth.api.removeUser({
    body: { userId },
    headers: await headers(),
  });

  redirect("/admin/users");
}
