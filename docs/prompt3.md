# Feature backlog

- [ ] Add a "Sets" page that shows all Lego sets the user has added to any of their lists, grouped by list.
- [ ] For admins, add a page that shows all sets
that are currently cached.

- [ ] Add pagination to the Rebrickable search results, so that users can see more than just the first page of results. Fetch at most 10 results at a time, and add "Next" and "Previous" buttons to navigate through the pages and make "10" switchable to "20", "50", "100" results per page.
- [ ] Add sorting and filtering options to the Rebrickable search results, so that users can sort by year, name, set number, etc.

- [ ] Add https://www.npmjs.com/package/@brakbricks/brickset-api to get prices of sets by set number.
	- Cache retrieved prices with the set numbers in a separate table in the database, store the timestamp of last retrieval.
	- Display the price alongside the set information when viewing sets in lists and search results.
- [ ] Add a button to check and update prices for all sets if the cached price is older than a given threshold set to 30 days by default.

- Users added by admin get name set as "admin" instead of their actual name; is this the name of the admin who created them? Hide or omit this, until approved to not be "admin" just hide.
- There is name, username, and displayUsername. Ugh, this is when one goes vibe-coding HARD without looking at all output as one is prototyping. What to actually keep: What does BetterAuth need?
- Add self-service for users, instead of just sign-out button in upper right, add a profile button that has dropdowns for "View Profile", "Edit Profile", "Sign Out", on "Edit Profile" page, allow changing display name, username, email, and password.
- Add open to enabled sign up via email (instead of just manual user creation by admin only). Add option to enable this and enable option to have a whitelist of allowed email domains for sign up and add management page for this and as final option, do pending sign-ups and approve or deny them. Denial removes email. There is not verification email emails and will not be, there are no notifications via email.

# Low-priority backlog

- Make it possible to "assume" the identity of another user as an admin, so that the admin can see what that user sees. Add a button on the user management page for each user to "Assume identity", which when make the admin user view the lists and sets of that user, but allow the admin to return to their own identity easily so they are not locked out.

- On *Vercel* deploy with Neon postgresql instance (not sqlite or local docker postgresql!), the first initial user that signs in does not become admin automatically. This seems like a bug.
- look into automatically adding key for dotenvx with command for first time deploy on Vercel
