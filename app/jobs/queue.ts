import { defineQueue, node } from "@thorium-sim/plainjob";
import { DatabaseSync } from "node:sqlite";
import type { JobTypes } from "./types.ts";
import { jobLogger } from "./logger.ts";

export function getQueue(dbFile: string) {
  let database = new DatabaseSync(dbFile, { open: true });

  const connection = node(database);

  return defineQueue<JobTypes>({ connection, logger: jobLogger });
}
