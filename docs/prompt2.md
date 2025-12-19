# General notes

- Use `work.md` to log your plans, actions and status. After documenting and summarizing a unit of work, commit your changes using git.

# Tasks by priority

- [ ] Add a command for devs to clean up directories, e.g. `pnpm clean` that removes `node_modules`, `.next`, `dist`, etc. Consider rimraf or similar tools for cross-platform compatibility.
- [ ] Switch from npm to pnpm for package management. Use your previously defined tool to clean instead of using something like `rm -rf`. Update all relevant documentation to reflect this change.

- [ ] Dark mode works, but toggle does nothing, it always remains in dark mode, even though the toggle UI text changes state and says "Light".
- [ ] Replace the text for the toggle with an icon that indicates dark mode or light mode instead, e.g. a sun and moon icon.
- [ ] The dropdown for the user role is white in dark mode, making all roles unreadable except the one t hat is selected (which has a dark background). Make the dropdown readable in both modes and make it consistent with the rest of the design.
