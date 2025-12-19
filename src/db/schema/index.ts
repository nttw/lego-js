import * as sqlite from "./sqlite";
import * as pg from "./pg";

import { getDbDialect } from "../runtime";

const schema: typeof sqlite | typeof pg = getDbDialect() === "pg" ? pg : sqlite;

// Export table objects under stable names, regardless of backend.
// (Types are intentionally loosened here to avoid leaking dialect-specific
// generics into the rest of the app; runtime correctness is ensured by selecting
// the same dialect as `@/db`.)
export const authUser: typeof sqlite.authUser | typeof pg.authUser = schema.authUser;
export const authSession: typeof sqlite.authSession | typeof pg.authSession = schema.authSession;
export const authAccount: typeof sqlite.authAccount | typeof pg.authAccount = schema.authAccount;
export const authVerification: typeof sqlite.authVerification | typeof pg.authVerification = schema.authVerification;

export const rebrickableSet: typeof sqlite.rebrickableSet | typeof pg.rebrickableSet = schema.rebrickableSet;
export const legoList: typeof sqlite.legoList | typeof pg.legoList = schema.legoList;
export const legoListSet: typeof sqlite.legoListSet | typeof pg.legoListSet = schema.legoListSet;
export const legoListViewer: typeof sqlite.legoListViewer | typeof pg.legoListViewer = schema.legoListViewer;
