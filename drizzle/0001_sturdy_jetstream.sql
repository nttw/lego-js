CREATE TABLE `brickset_price_cache` (
	`setNum` text PRIMARY KEY NOT NULL,
	`rrpEur` real,
	`lastFetchedAt` integer NOT NULL,
	`rawJson` text
);
