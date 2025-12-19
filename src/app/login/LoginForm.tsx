"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/login/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <form action={action} className="flex w-full max-w-sm flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-sm opacity-90">Username</span>
        <input
          name="username"
          autoComplete="username"
          className="rounded-md border border-black/10 bg-transparent px-3 py-2 dark:border-white/15"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm opacity-90">Password</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          className="rounded-md border border-black/10 bg-transparent px-3 py-2 dark:border-white/15"
        />
      </label>

      {state?.error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-black px-3 py-2 text-sm text-white disabled:opacity-60 dark:bg-white dark:text-black"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-xs opacity-70">
        If no users exist yet, the first successful sign-in creates the initial
        admin.
      </p>
    </form>
  );
}
