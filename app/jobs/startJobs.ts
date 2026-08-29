import { fork } from "node:child_process";
import { getQueue } from "./queue.ts";
import type { JobTypes } from "./types.ts";

export const queueDbFile = "./app/db/jobs.db";

const queue = getQueue(queueDbFile);

function startWorker<JobType extends keyof JobTypes>(jobType: JobType) {
  const worker = fork("./app/jobs/worker.ts", [queueDbFile, jobType]);
  worker.on("exit", (code) => console.info(`Worker exited with code ${code}`));
  return worker;
}

let started = false;
export function startJobs() {
  if (started) return;
  startWorker("sendEmail");
  startWorker("newsletterSend");
  queue.schedule("newsletterSend", { cron: "*/60 * * * *" });
  started = true;
}
