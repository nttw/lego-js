We want to create a manager for Lego sets for enthusiasts to catalog and manage their collections.

# Technical Plan

The application should be based on Next.js and TypeScript, use drizzle with a SQLite database for persistence, and implement authentication with Better-Auth documented at https://www.better-auth.com/llms.txt for LLMs.

To get data about Lego sets, we have the public Rebrickable API documented at https://rebrickable.com/api/v3/docs/ - but https://www.npmjs.com/package/@brakbricks/rebrickable-api offers a type-safe library for this and it can be inspected when installed because it is using TypeScript. Otherwise, it is documented at https://brakbricks.github.io/rebrickable-api/ to check. API keys should be stored in .env files, and should not be committed to version control and added to .gitignore to prevent mistakes.

Better-Auth should use username and password authentication, as pointed out in llm.txt, data is persisted like data as first explained.

# Features

Dark mode should be included in all visual designs and should be toggleable.

After logging in, users have a role of either "admin" or "user". Admins can manage users, while users can manage their sets. Management of users consists of creating users with a name and password, editing these, or deleting them, as well as changing their roles.

A user can create lists that have a name and add Lego sets to those lists. Lists should have a unique ID so they can be renamed and used for URLs.

To add Lego sets to lists, users would search for sets by name or set number. The results show the set name, set number, year released, and an image of the set. We cache results in the database to minimize API calls, but more importantly when we use this data for displaying data about the user's set lists and their details. The user can select from the search result and add to one or more of their lists. The user can also remove sets from their set lists when viewing them, and their sets display the set name, set number, year released, and the image visually.

Users can share their lists by allowing other users to view them, by entering their username and add them to a list of viewers for that list. This allows the other user to see the list and its contents that looks the same as when the owner views it, but not edit them, so it should reuse code.

# Methodology

To document, write a `work.md` file where you plan and document your steps as TODO list, and after completing each step, mark it as DONE. If problems arise, document them as well and how you solved them. You can also put down ideas, questions or potential problems if perceive anything in your work when you take these instructions from what you are supplied as an agent. When you complete your work, write a summary to the `work.md`.
