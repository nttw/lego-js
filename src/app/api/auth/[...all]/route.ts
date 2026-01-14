import { sql } from "drizzle-orm";
import { toNextJsHandler } from "better-auth/next-js";

import { db } from "@/db";
import { authUser } from "@/db/schema";
import { getEnv } from "@/lib/env";
import { auth } from "@/lib/auth";

const handler = toNextJsHandler(auth);

async function hasAnyUsers(): Promise<boolean> {
	const rows = await db.select({ count: sql<number>`count(*)` }).from(authUser);
	return (rows[0]?.count ?? 0) > 0;
}

function allowPublicSignup(): boolean {
	return ["1", "true", "yes"].includes(
		String(getEnv("ALLOW_PUBLIC_SIGNUP") ?? "").trim().toLowerCase(),
	);
}

function isSignupRequest(request: Request): boolean {
	const url = new URL(request.url);
	const path = url.pathname.toLowerCase();
	return path.includes("sign-up") || path.includes("signup");
}

export async function GET(request: Request) {
	if (isSignupRequest(request) && !allowPublicSignup() && (await hasAnyUsers())) {
		return new Response("Not Found", { status: 404 });
	}
  /* the ignore below had a warning with @, so I removed it for now */
	// ts-expect-error - handler typing is looser than Next's Request type.
	return handler.GET(request);
}

export async function POST(request: Request) {
	if (isSignupRequest(request) && !allowPublicSignup() && (await hasAnyUsers())) {
		return new Response("Not Found", { status: 404 });
	}
  /* the ignore below had a warning with @, so I removed it for now */
	// ts-expect-error - handler typing is looser than Next's Request type.
	return handler.POST(request);
}
