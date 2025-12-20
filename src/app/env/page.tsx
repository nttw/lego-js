import Link from "next/link";

import { getEnv } from "@/lib/env";

export default async function EnvPage() {
  const hello = getEnv("HELLO");

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div>
        <p className="text-sm opacity-70">
          <Link href="/dashboard" className="hover:underline">
            Dashboard
          </Link>
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Environment</h1>
        <p className="mt-1 text-sm opacity-80">Server-side value of HELLO</p>
      </div>

      <section className="mt-6">
        <div className="rounded-md border border-black/20 p-3 dark:border-white/15">
          <div className="text-sm opacity-70">HELLO</div>
          <div className="mt-1 break-all font-mono text-sm">{hello ?? "(missing)"}</div>
        </div>
      </section>
    </main>
  );
}
