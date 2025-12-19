# Work log #1

## TODO
- [x] Add env template + document required env vars
- [x] Set up Drizzle + SQLite (schema + migrations + db helper)
- [x] Integrate Better Auth (username/password) with Drizzle adapter
- [x] Add roles (admin/user) and basic access helpers
- [x] Implement dark mode toggle
- [x] Build auth pages (login/logout) and session-aware home redirect
- [x] Build dashboard (list CRUD: create + view)
- [x] Build list page (view sets, remove sets, rename list)
- [x] Implement list sharing (add/remove viewers by username; view-only access)
- [x] Implement Rebrickable search + DB caching + add-to-multiple-lists
- [x] Build admin user management (create/edit/delete users; change roles)
- [x] Validate via build/typecheck

## Notes / Decisions
- Use Better Auth `username` + `admin` plugins.
- UI will use username/password only; internally we still store an email (derived as `${username}@local.invalid`) to satisfy Better Auth’s email/password authenticator.

## Progress

- DONE: Added .env.example and documented env vars.
- DONE: Added Drizzle schema + config, generated migration, and created SQLite DB under data/.
- DONE: Wired Better Auth with Next.js route handler and Drizzle adapter; enabled username + admin plugins.
- DONE: Added dark mode toggle + theme init script.
- DONE: Implemented login flow (bootstrap first user as admin) and session-aware redirects.
- DONE: Implemented dashboard, list detail (including set removal/rename), list sharing, set search + caching, and admin user management.

## Summary

This app now supports username/password login (Better Auth), dark mode, list creation, list sharing (view-only for viewers), searching sets via Rebrickable with DB caching, and admin user management.
