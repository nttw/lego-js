# Vercel Environment Warning Cleanup - 2026-05-24

## Context

The Vercel dashboard showed `Needs Attention` badges for Neon integration
environment variables in project `nttws-projects/lego-js`. The UI advised that
credential-shaped values were stored as readable `Encrypted` variables rather
than write-only `Sensitive` variables.

This repository already has a separate production-secret design:

- `.env.prod` is committed, with production values encrypted by dotenvx.
- `.env.keys` is local and ignored.
- Vercel supplies `DOTENV_PRIVATE_KEY_PROD` so the application can decrypt
  `.env.prod` during build/runtime.
- Application database selection reads `PG_DATABASE_URL`, not the standard
  Neon integration variable names.

All analysis and records in this directory deliberately omit plaintext secret
values.

## Investigation

A local comparison was performed by decrypting `.env.prod` in memory and
comparing values to an existing ignored Vercel environment pull. Values were
not printed.

The comparison established:

- Encrypted production `PG_DATABASE_URL` matched Vercel `DATABASE_URL`.
- Encrypted production `PG_DATABASE_URL` matched Vercel `POSTGRES_URL`.
- `DOTENV_PRIVATE_KEY_PROD` in the local ignored key file matched Vercel's
  cached production value.
- The other dotenvx application secrets were not duplicated under matching
  Vercel environment-variable names.

This showed that the Neon integration had created readable duplicate database
credential variables outside the repository's dotenvx-protected path.

## Changes Made

On 2026-05-24, the cleanup script was run once using the original local
wrapper:

```powershell
pwsh .\.vercel\apply-fix-vercel-env-warnings.ps1
```

It made these Vercel project configuration changes:

1. Updated `DOTENV_PRIVATE_KEY_PROD` in `Production` using its existing value
   with the `Sensitive` classification.
2. Removed these Neon integration variables from Vercel project settings:

```text
DATABASE_URL
DATABASE_URL_UNPOOLED
PGPASSWORD
POSTGRES_PASSWORD
POSTGRES_PRISMA_URL
POSTGRES_URL
POSTGRES_URL_NON_POOLING
POSTGRES_URL_NO_SSL
```

No Neon credential was rotated. No deployment was created by this cleanup.

These Neon-generated, unflagged variables remained in Vercel:

```text
NEON_PROJECT_ID
PGDATABASE
PGHOST
PGHOST_UNPOOLED
PGUSER
POSTGRES_DATABASE
POSTGRES_HOST
POSTGRES_USER
```

## Verification

After the change, a read-only Vercel API request reported:

- `DOTENV_PRIVATE_KEY_PROD` has type `sensitive` for `production`.
- The eight removed Neon credential variables are absent from current project
  environment settings.

The `vercel env ls` table still rendered `DOTENV_PRIVATE_KEY_PROD` as
`Encrypted`, even though the API returned the actual type as `sensitive`.

The pre-existing active production deployment was checked through authenticated
`vercel curl`, and `/` redirected to `/login` while `/login` rendered the
login page. This checks the already-deployed artifact only: that deployment
predates the environment-variable removal and does not by itself prove a future
deployment.

## Consequences And Caution

The removed variables no longer appear on the Vercel environment-variable
settings page. That page represents current configuration, not deletion
history.

The removal was based on repository runtime usage, but it was not proven in
advance that the removed integration-managed variables were irrelevant to all
Vercel/Neon integration behavior outside the application code. For that
reason, a future production deployment should be verified carefully.

If restoration is required, prior values are available only in local ignored
environment material; do not place those values into tracked documentation.
Restoring the readable Vercel variables may reintroduce the same dashboard
warnings.

## Scripts

- `verify-vercel-env-warning-cleanup.ps1` checks the completed state and the
  local dotenvx/Vercel duplicate relationship without printing secrets.
- `apply-vercel-env-warning-cleanup.ps1` invokes the original cleanup behavior
  behind an explicit confirmation. It is retained for audit/recovery context;
  review it before use because it can change Vercel project configuration.

Both scripts rely on local ignored files (`.env.keys` and
`.vercel/.env.production.local`) and an authenticated Vercel CLI session.
