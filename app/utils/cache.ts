import {
  nodeSqliteCacheAdapter,
  createNodeSqliteCacheTable,
} from "cachified-adapter-sqlite/node-sqlite"; // node:sqlite
import { DatabaseSync } from "node:sqlite";

export let sqlite = new DatabaseSync("./app/db/cache.db", { open: true });
sqlite.exec(`PRAGMA busy_timeout = 5000;
PRAGMA foreign_keys = ON;
PRAGMA synchronous = NORMAL;`);

const TABLE_NAME = "cache";

createNodeSqliteCacheTable(sqlite, TABLE_NAME);

export const cache = nodeSqliteCacheAdapter({
  database: sqlite,
  tableName: TABLE_NAME,
  name: "cache",
});
