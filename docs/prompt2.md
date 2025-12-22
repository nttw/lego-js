# General notes

- Use `work.md` to log your plans, actions and status. After documenting and summarizing a unit of work, commit your changes using git.

# Tasks by priority

- [x] Add a command for devs to clean up directories, e.g. `pnpm clean` that removes `node_modules`, `.next`, `dist`, etc. Consider rimraf or similar tools for cross-platform compatibility.
- [x] Switch from npm to pnpm for package management. Use your previously defined tool to clean instead of using something like `rm -rf`. Update all relevant documentation to reflect this change.

- [x] Dark mode works, but toggle does nothing, it always remains in dark mode, even though the toggle UI text changes state and says "Light".
- [x] Replace the text for the toggle with an icon that indicates dark mode or light mode instead, e.g. a sun and moon icon.
- [x] The dropdown for the user role is white in dark mode, making all roles unreadable except the one t hat is selected (which has a dark background). Make the dropdown readable in both modes and make it consistent with the rest of the design.

---

- [x] As alternative to sqlite, add support for PostgreSQL as database backend. If you look at the .env file (.env.local), you see DATABASE_URL is using sqlite with a file. But there is also PG_DATABASE_URL that uses a Postgres database. So if PG_DATABASE_URL is set, use that. But if DATABASE_URL is set, use sqlite for now like before. Try to isolate this logic so the rest of the code for Drizzle can be used for both backends as much as possible. There is a drizzle/meta directory has snapshots for sqlite. How can we handle both backends? Explain it to me and document it in the README.md as needed.

These features are still in the planning stage and are not yet sanctioned for development if not otherwise noted.

- [x] Use dotenv to commit encrypted secrets to the repo, making it easier to deploy.
- [x] Add justfile with common tasks like `just setup`, `just migrate`, `just dev`, `just build`, `just clean`, etc.

---

- [x] As alternative to sqlite, add support for Postgres as database backend, using environment variables to select which one to use. Consider how this is done best with Drizzle. Check that all code works with both backends and is fully implemented.
- [x] For local development, add a docker-compose file that sets up a Postgres database for easy local testing
	- Consider how the initial migration is done best, e.g. via an init script in the database container.
- [x] Document initial setup and migrations. It is not needed to migrate from sqlite to Postgres, just document how to set up either one from scratch.

---

- [x] We have a DB backend for both SQLite and Postgres. When deploying, it is cumbersome to have to manually run the initial migration. So it would be good to have the initial migration run automatically on first start if the database is empty. This can be tested locally with docker, so I have prepared a testing configuration with PG_DATABASE_URL=postgresql://postgresql:localhost:5432/postgres?sslmode=false so can test this when we implement this feature. As you can see, this is safe because it only connects to a local database and does not need a password, only user. It seems this action could best be done in createDb in db/index.ts, but you should make sure if this is the best place. There is a uncommented migrateDb function close which you could use as base. The createDb function is typed as any, which you may want to fix and then use the migrate function you find there. You need to use the directory for sqlite and postgres respectively, so this would work for both backends. Make sure to test both backends locally with docker for Postgres and the default sqlite file for sqlite. Document how this works in the README.md as needed.
