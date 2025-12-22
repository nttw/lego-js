const cmd = process.argv[2];

if (cmd !== "generate" && cmd !== "migrate") {
  console.error("Usage: node scripts/db-guard.mjs <generate|migrate>");
  process.exit(1);
}

console.error(
  `Refusing to run db:${cmd} without an explicit dialect.\n` +
    `Use one of:\n` +
    `  pnpm db:${cmd}:sqlite\n` +
    `  pnpm db:${cmd}:pg\n`,
);

process.exit(1);
