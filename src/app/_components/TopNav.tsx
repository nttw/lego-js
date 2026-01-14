import Link from "next/link";

import { signOutAction } from "@/app/actions/auth";
import { buttonSm } from "@/app/_components/buttonStyles";
import { ThemeToggle } from "@/app/_components/ThemeToggle";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/roles";
import { headers } from "next/headers";

export async function TopNav() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <header className="border-b border-black/20 px-4 py-3 dark:border-white/10">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Link href={session ? "/dashboard" : "/"} className="font-semibold">
            Lego Lists
          </Link>
          {session ? (
            <nav className="flex items-center gap-3 text-sm opacity-90">
              <Link href="/dashboard" className="hover:underline">
                Dashboard
              </Link>
              <Link href="/sets/search" className="hover:underline">
                Search
              </Link>
              {isAdminRole(session.user.role) ? (
                <>
                  <Link href="/admin/cache" className="hover:underline">
                    Cache
                  </Link>
                  <Link href="/admin/users" className="hover:underline">
                    Users
                  </Link>
                </>
              ) : null}
            </nav>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {session ? (
            <form action={signOutAction}>
              <button
                type="submit"
                className={buttonSm}
              >
                Sign out
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </header>
  );
}
