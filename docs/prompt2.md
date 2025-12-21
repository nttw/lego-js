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
