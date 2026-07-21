# Parallel Cloudflare deployment

This deployment is additive. It does not replace or update the existing Vercel deployment.

| Deployment | URL | SQL dialect | Data store |
| --- | --- | --- | --- |
| D1 | <https://lego-js-cloudflare-d1.nttw.workers.dev> | SQLite | Separate Cloudflare D1 database |

There is no Hyperdrive deployment. Hyperdrive is not a managed PostgreSQL database: it connects a
Worker to an externally hosted PostgreSQL or MySQL database. The test Hyperdrive Worker and its
configuration were removed so Cloudflare does not access the Vercel production database.

## Runtime boundary

The application and Better Auth continue to use Drizzle:

- Cloudflare D1 uses Drizzle's `drizzle-orm/d1` connection driver and Better Auth's `sqlite`
  provider.
- Local development and Vercel retain the existing Node adapter (`better-sqlite3` or `pg`).

Cloudflare bindings are accessed only from `src/db/cloudflare.ts`. The local/Vercel adapter never
calls `getCloudflareContext()`. The D1 client is request-scoped; local/Vercel clients keep their
process-level singleton behavior.

## Secrets

The dotenvx design is unchanged:

1. `.env.prod` remains committed with encrypted application values.
2. The D1 Worker stores only `DOTENV_PRIVATE_KEY_PROD` as a Cloudflare secret.
3. Non-secret deployment choices (`DB_DIALECT`, `CLOUDFLARE_DB_BACKEND`, and
   `BETTER_AUTH_URL`) live in `wrangler.jsonc`.

The secret recipe reads the ignored `.env.keys` file and pipes the key to Wrangler over stdin.

## Repeatable command

```bash
just cf-deploy-d1
```

The recipe builds, applies D1 migrations, deploys the Worker, and refreshes
`DOTENV_PRIVATE_KEY_PROD`. Individual build, migration, and secret recipes are listed by
`just --list`.

## `node:fs` and `better-sqlite3`

Current Cloudflare Workers support `node:fs` with `nodejs_compat`, but it is a virtual filesystem:
bundled files are read-only and `/tmp` is request-scoped and non-persistent. That makes `node:fs`
appropriate for reading the bundled encrypted `.env.prod`, but inappropriate for a durable SQLite
database file.

The stricter incompatibility is `better-sqlite3`: it is a native Node addon (`.node` binary), which
workerd cannot execute. It therefore remains only in the Node adapter. D1 supplies the durable
SQLite-compatible service for the Cloudflare deployment.
