# Agent Guidelines

These guidelines are advisory and still WIP. Use judgment, but treat them as project-specific lessons learned.

## Git and Completion Discipline

- The user usually handles commits. Do not commit unless explicitly asked, or unless a deploy/tooling flow truly requires it and you have explained why first.
- Never commit known-broken work as a completion commit.
- Before committing, verify the work appropriate to the change: at minimum run the relevant audit/lint/build/test/deploy checks, or clearly state what could not be verified.
- If deployment is part of the task, do not treat "deployment command returned a URL" as success. Verify the live URL responds correctly.
- If a commit was created to unblock deployment attribution or tooling, say that explicitly before doing it where possible, and verify production before calling the task complete.
- If something breaks after a commit, fix it with a follow-up commit rather than rewriting history unless the user asks otherwise.

## Dependency and Security Fixes

- Keep security fixes scoped to dependency updates unless the user explicitly asks for code changes.
- Prefer `pnpm audit`, targeted `pnpm update`, and lockfile/package updates before touching runtime code.
- Do not modify `src/lib/env.ts`, dotenvx setup, auth config, or database runtime selection as part of audit fixes unless the audit explicitly requires it.
- If a build emits a warning unrelated to the vulnerability, report it separately instead of fixing it opportunistically.

## Vercel Deploys

- Prefer normal remote builds: `vercel deploy --prod --yes` or `just deploy`.
- Do not use `vercel build` + `vercel deploy --prebuilt` from this Windows workspace unless the user explicitly asks and accepts the risk.
- After deploy, verify `/` and `/login` return HTTP 200.

## Verification

Before declaring security/dependency work done, run:

```powershell
pnpm audit
pnpm lint
pnpm build
```

After deployment, verify the live app returns HTTP 200 for `/` and `/login`.
