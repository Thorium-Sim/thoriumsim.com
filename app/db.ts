import { DatabaseSync } from "node:sqlite";
import { createSqliteDatabase } from "remix/data-table/sqlite";

let sqlite = new DatabaseSync("./app/db/data.db", { open: true });
sqlite.exec(`PRAGMA busy_timeout = 5000;
PRAGMA foreign_keys = ON;
PRAGMA synchronous = NORMAL;`);
let db = createSqliteDatabase(sqlite);

export { db };
