CREATE TABLE "brickset_price_cache" (
	"setNum" text PRIMARY KEY NOT NULL,
	"rrpEur" double precision,
	"lastFetchedAt" timestamp NOT NULL,
	"rawJson" text
);
