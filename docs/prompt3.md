# Feature backlog

- [ ] If you look at this next.js project, we manage Lego set lists and we have a cache of images in our database. For the admin role, I would like to add a new feature: You have a new tab before user management called "Cache" where all all data from cached Lego sets are shown in a lists similar to a user sees a list of their Lego sets (see that you can reuse code and keep the same style). With a button in this list, we can delete the image from the cache, so that we can free up space in the database. We see the image while it is still cached in this view, but here, we do not re-download it. But now, the next time a user looks at their tab for lists and sees a Lego set with missing a image image, so we would need to re-fetch it with our existing logic (we MUST not rewrite existing utility functions for this).
	- Report to me if nullability would be a problem and that we do not have to make changes to the database (as I do not have started my local docker instance yet due to memory for now).

- [x] Add https://www.npmjs.com/package/@brakbricks/brickset-api to get prices of sets by set number.
	- [x] Cache retrieved prices with the set numbers in a separate table in the database, store the timestamp of last retrieval.
	- [x] Display the price alongside the set information when viewing sets in lists and search results.
- [x] Add a button to check and update prices for all sets if the cached price is older than a given threshold set to 30 days by default.
- [ ] Consider AUTO refreshing after a set TTL

- [ ] Add a "Sets" page that shows all Lego sets the user has added to any of their lists, grouped by list.
- [ ] For admins, add a page that shows all sets
that are currently cached.

- [ ] Add pagination to the Rebrickable search results, so that users can see more than just the first page of results. Fetch at most 10 results at a time, and add "Next" and "Previous" buttons to navigate through the pages and make "10" switchable to "20", "50", "100" results per page.
- [ ] Add sorting and filtering options to the Rebrickable search results, so that users can sort by year, name, set number, etc.

- [ ] Hover over set images to see larger version in a popup, or click set to open details page with larger image and more info.

- Show user names on shared lists.
- Add description and notes fields to user lists and sets in lists.
- Allow users to add tags to sets in their lists (for better organization and searching in the future).


- Users added by admin get name set as "admin" instead of their actual name; is this the name of the admin who created them? Hide or omit this, until approved to not be "admin" just hide.
- There is name, username, and displayUsername. Ugh, this is when one goes vibe-coding HARD without looking at all output as one is prototyping. What to actually keep: What does BetterAuth need?
- Add self-service for users, instead of just sign-out button in upper right, add a profile button that has dropdowns for "View Profile", "Edit Profile", "Sign Out", on "Edit Profile" page, allow changing display name, username, email, and password.
	- https://www.better-auth.com/docs/plugins/username
	- suggests that those parts are used, but to me it seems really hard to tell why emails, name, then username and displayUsername are used. The last two are optional, but why name AND username? May be because of some migration handling capabilities offered by BetterAuth.
- Add open to enabled sign up via email (instead of just manual user creation by admin only). Add option to enable this and enable option to have a whitelist of allowed email domains for sign up and add management page for this and as final option, do pending sign-ups and approve or deny them. Denial removes email. There is not verification email emails and will not be, there are no notifications via email.

# Low-priority backlog

- Make it possible to "assume" the identity of another user as an admin, so that the admin can see what that user sees. Add a button on the user management page for each user to "Assume identity", which when make the admin user view the lists and sets of that user, but allow the admin to return to their own identity easily so they are not locked out.

- Check mobile responsiveness and fix any issues with layout or usability on small screens.
- Check style consistency across the app and fix any discrepancies in colors, fonts, spacing, etc. Check if styles can be consolidated or reused better.

- On *Vercel* deploy with Neon postgresql instance (not sqlite or local docker postgresql!), the first initial user that signs in does not become admin automatically. This seems like a bug.
- look into automatically adding key for dotenvx with command for first time deploy on Vercel
- Add command to migrate Neon after deploy on Vercel
- Add staging environment with Neon database for testing without local docker
- Add commands to run against staging and prod on Vercel

- Consider using sops for things like DOTENV_PRIVATE_KEY_PROD so simple global passwords can be stored in password manager and used for decrypting secrets files.
	- maybe: use justfile to write out from an source-controlled template the password from memory to the gitignored file
- Use main branch instead of master
- Consider adding github to push backups of code
- Add testing framework
- Figure out how tests can be created to cover nextjs server and client side code; integration tests with spinning up testcontainers?

# Future tasks

For now, "self-service" for users are disabled to my knowledge, if you go to any page not logged in, you can only log in, the exception is if you are the first user to get promoted to admin; the only public page had been env so I could check when deployed if logging in and registry would work when deployed.

The usage of emails is disabled for now, so an admin manually adds users. Later I will add a system so a user can be added by requesting approval from an admin, who receives a request queue to approve or reject.

I will later add alternatives such as setting the initial password for a user from an env var and calling an endpoint with the username for an admin with that password, so this can be changed later.

As for writing to foreign lists, for now you can grant viewing a list, but writing by granting this from user A to user B is for the future.
