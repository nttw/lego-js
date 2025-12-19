import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { requireSession } from "@/lib/session";
import { isAdminRole } from "@/lib/roles";
import {
  createUserAction,
  deleteUserAction,
  setPasswordAction,
  setRoleAction,
  updateNameAction,
} from "@/app/admin/users/actions";

type AdminUser = {
  id: string;
  name: string;
  username?: string | null;
  displayUsername?: string | null;
  email?: string | null;
  role?: string | null;
};

type ListUsersResponse = {
  users?: AdminUser[];
};

function toHeaderRecord(h: Awaited<ReturnType<typeof headers>>): Record<string, string> {
  const record: Record<string, string> = {};
  h.forEach((value, key) => {
    record[key] = value;
  });
  return record;
}

export default async function AdminUsersPage() {
  const session = await requireSession();
  if (!isAdminRole(session.user.role)) redirect("/dashboard");

  const res = await auth.api.listUsers({
    query: { limit: 100, offset: 0 },
    headers: toHeaderRecord(await headers()),
  });

  const data: ListUsersResponse =
    res instanceof Response ? ((await res.json()) as ListUsersResponse) : (res as ListUsersResponse);
  const users = data.users ?? [];

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold">User management</h1>
      <p className="mt-1 text-sm opacity-80">Admins can create and manage users.</p>

      <section className="mt-6 rounded-md border border-black/20 p-4 dark:border-white/15">
        <h2 className="text-lg font-semibold">Create user</h2>
        <form action={createUserAction} className="mt-3 grid gap-3 sm:grid-cols-4">
          <input
            name="username"
            placeholder="username"
            className="rounded-md border border-black/20 bg-transparent px-3 py-2 text-sm dark:border-white/15"
          />
          <input
            name="name"
            placeholder="name"
            className="rounded-md border border-black/20 bg-transparent px-3 py-2 text-sm dark:border-white/15"
          />
          <input
            type="password"
            name="password"
            placeholder="password"
            className="rounded-md border border-black/20 bg-transparent px-3 py-2 text-sm dark:border-white/15"
          />
          <select
            name="role"
            defaultValue="user"
            className="rounded-md border border-black/20 bg-background px-3 py-2 text-sm text-foreground dark:border-white/15"
          >
            <option value="user" className="bg-background text-foreground">
              user
            </option>
            <option value="admin" className="bg-background text-foreground">
              admin
            </option>
          </select>
          <button
            type="submit"
            className="sm:col-span-4 rounded-md border border-black/20 bg-transparent px-3 py-2 text-sm text-foreground hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
          >
            Create
          </button>
        </form>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Users</h2>
        <ul className="mt-4 grid gap-3">
          {users.map((u) => (
            <li
              key={u.id}
              className="rounded-md border border-black/20 p-4 dark:border-white/15"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{u.name}</div>
                  <div className="text-sm opacity-80">
                    {u.username ?? u.displayUsername ?? u.email}
                    {u.role ? ` • ${u.role}` : ""}
                  </div>
                </div>

                <form action={deleteUserAction.bind(null, u.id)}>
                  <button
                    type="submit"
                    className="rounded-md border border-black/20 px-3 py-1 text-sm dark:border-white/15"
                  >
                    Delete
                  </button>
                </form>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <form action={updateNameAction.bind(null, u.id)} className="flex gap-2">
                  <input
                    name="name"
                    defaultValue={u.name}
                    className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 text-sm dark:border-white/15"
                  />
                  <button
                    type="submit"
                    className="rounded-md border border-black/20 px-3 py-2 text-sm dark:border-white/15"
                  >
                    Save
                  </button>
                </form>

                <form action={setRoleAction.bind(null, u.id)} className="flex gap-2">
                  <select
                    name="role"
                    defaultValue={u.role ?? "user"}
                    className="w-full rounded-md border border-black/20 bg-background px-3 py-2 text-sm text-foreground dark:border-white/15"
                  >
                    <option value="user" className="bg-background text-foreground">
                      user
                    </option>
                    <option value="admin" className="bg-background text-foreground">
                      admin
                    </option>
                  </select>
                  <button
                    type="submit"
                    className="rounded-md border border-black/20 px-3 py-2 text-sm dark:border-white/15"
                  >
                    Set
                  </button>
                </form>

                <form action={setPasswordAction.bind(null, u.id)} className="flex gap-2">
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="new password"
                    className="w-full rounded-md border border-black/20 bg-transparent px-3 py-2 text-sm dark:border-white/15"
                  />
                  <button
                    type="submit"
                    className="rounded-md border border-black/20 px-3 py-2 text-sm dark:border-white/15"
                  >
                    Set
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
