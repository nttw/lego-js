This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Database (SQLite / Postgres)

This app supports **two** database backends via Drizzle:

- **Postgres** when `PG_DATABASE_URL` is set
- **SQLite** otherwise (using `DATABASE_URL`, defaulting to `file:./data/lego.sqlite`)

Backend selection is centralized in [src/db/runtime.ts](src/db/runtime.ts). During `next build`, the app forces an in-memory SQLite database to avoid build-time DB connectivity issues.

### Environment variables

- `PG_DATABASE_URL` (preferred when set): standard Postgres connection string, e.g. `postgres://user:pass@host:5432/dbname`
- `DATABASE_URL` (SQLite): `file:./data/lego.sqlite`

### Security + diagnostics toggles

This app intentionally runs with **no public registration UI**. However, auth endpoints still exist under `/api/auth/*` (Better Auth).
To keep deployments safe by default, the app gates certain behaviors behind env flags.

- `ALLOW_PUBLIC_SIGNUP` (default: disabled)
	- When unset/falsey, requests to auth *sign-up* endpoints return `404` once the DB has any users.
	- Bootstrap still works when the database is empty (the first user can be created).
	- Set to `1`/`true`/`yes` to temporarily enable public signup endpoints.

- `ALLOW_PUBLIC_DIAGNOSTICS` (default: disabled)
	- When unset/falsey, `/env` is admin-only.
	- Set to `1`/`true`/`yes` to make `/env` publicly accessible as a deployment sanity check.

Notes:

- Env values are loaded via `process.env` and (optionally) `dotenvx` based on `NODE_ENV` (see [src/lib/env.ts](src/lib/env.ts)).
- Prefer enabling these only briefly during first deploy / recovery, then disabling.

Optional override:

- `DB_DIALECT`: force the backend selection when both URLs are present (or to force one backend).
	- Set to `PG` to use `PG_DATABASE_URL`
	- Set to `SQLITE` to use `DATABASE_URL` (or the default sqlite file if unset)

If `DB_DIALECT` is **not** set and both URLs are present, the app defaults to **Postgres** (because `PG_DATABASE_URL` is set).

### Drizzle schema + migrations for both backends

Drizzle uses **dialect-specific schema builders**, so we keep:

- SQLite schema in [src/db/schema/auth.ts](src/db/schema/auth.ts) and [src/db/schema/app.ts](src/db/schema/app.ts)
- Postgres schema in [src/db/schema/pg](src/db/schema/pg)

Migrations/snapshots must also be dialect-specific:

- SQLite migrations live in [drizzle](drizzle) (existing)
- Postgres migrations live in [drizzle/pg](drizzle/pg)

`drizzle-kit` picks which schema/out folder to use based on whether `PG_DATABASE_URL` is set (see [drizzle.config.ts](drizzle.config.ts)). This also keeps separate `drizzle/meta` snapshots per dialect (SQLite: `drizzle/meta`, Postgres: `drizzle/pg/meta`).

### Generating + running migrations

SQLite (default):

```bash
pnpm db:generate
pnpm db:migrate
```

Postgres:

```bash
set PG_DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DBNAME
pnpm db:generate
pnpm db:migrate
```

On PowerShell:

```powershell
$env:PG_DATABASE_URL='postgres://USER:PASSWORD@HOST:5432/DBNAME'
pnpm db:generate
pnpm db:migrate
```

### Troubleshooting

- If you see Postgres errors like `relation "session" does not exist`, it means the app is using Postgres (because `PG_DATABASE_URL`/`DB_DIALECT=PG` is set) but the Postgres database is still empty.
	- Ensure `PG_DATABASE_URL` points at the same database your app is using.
	- Run `pnpm db:generate` and `pnpm db:migrate` with `PG_DATABASE_URL` set (and optionally `DB_DIALECT=PG` if you also have `DATABASE_URL` set).
	- Note: SQLite migrations in [drizzle](drizzle) do not apply to Postgres; Postgres uses its own migration folder [drizzle/pg](drizzle/pg).

- The app **does** automatically run the initial migration on first start **if the database is empty**.
	- SQLite: if the SQLite file has no tables.
	- Postgres: if the `public` schema has no tables.
	- Migrations are applied from the dialect-specific folder (`drizzle` for SQLite, `drizzle/pg` for Postgres).
	- During `next build`, migrations are skipped (the build phase forces an in-memory SQLite database).

If you still want to run migrations manually (or are debugging migration issues), `pnpm db:migrate` remains supported.

## Getting Started

This repo uses `pnpm`.

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

To clean build artifacts and dependencies:

```bash
pnpm clean
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
