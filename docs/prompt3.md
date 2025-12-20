# Feature backlog

- [x] As alternative to sqlite, add support for Postgres as database backend, using environment variables to select which one to use. Consider how this is done best with Drizzle. Check that all code works with both backends and is fully implemented.
- [x] For local development, add a docker-compose file that sets up a Postgres database for easy local testing
	- Consider how the initial migration is done best, e.g. via an init script in the database container.
- [x] Document initial setup and migrations. It is not needed to migrate from sqlite to Postgres, just document how to set up either one from scratch.

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
