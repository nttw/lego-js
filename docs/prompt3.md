# Feature backlog

- We have a DB backend for both SQLite and Postgres. When deploying, it is cumbersome to have to manually run the initial migration. So it would be good to have the initial migration run automatically on first start if the database is empty. This can be tested locally with docker, so I have prepared a testing configuration with PG_DATABASE_URL=postgresql://postgresql:localhost:5432/postgres?sslmode=false so can test this when we implement this feature. As you can see, this is safe because it only connects to a local database and does not need a password, only user. It seems this action could best be done in createDb in db/index.ts, but you should make sure if this is the best place. There is a uncommented migrateDb function close which you could use as base. The createDb function is typed as any, which you may want to fix and then use the migrate function you find there. You need to use the directory for sqlite and postgres respectively, so this would work for both backends. Make sure to test both backends locally with docker for Postgres and the default sqlite file for sqlite. Document how this works in the README.md as needed.

- [ ] Add a "Sets" page that shows all Lego sets the user has added to any of their lists, grouped by list.
- [ ] For admins, add a page that shows all sets
that are currently cached.

- [ ] Add pagination to the Rebrickable search results, so that users can see more than just the first page of results. Fetch at most 10 results at a time, and add "Next" and "Previous" buttons to navigate through the pages and make "10" switchable to "20", "50", "100" results per page.
- [ ] Add sorting and filtering options to the Rebrickable search results, so that users can sort by year, name, set number, etc.

- [ ] Add https://www.npmjs.com/package/@brakbricks/brickset-api to get prices of sets by set number.
	- Cache retrieved prices with the set numbers in a separate table in the database, store the timestamp of last retrieval.
	- Display the price alongside the set information when viewing sets in lists and search results.
- [ ] Add a button to check and update prices for all sets if the cached price is older than a given threshold set to 30 days by default.

# Low-priority backlog

- Make it possible to "assume" the identity of another user as an admin, so that the admin can see what that user sees. Add a button on the user management page for each user to "Assume identity", which when make the admin user view the lists and sets of that user, but allow the admin to return to their own identity easily so they are not locked out.
