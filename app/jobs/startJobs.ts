import { getQueue } from "./queue.ts";
import type { JobTypes } from "./types.ts";

export const queueDbFile = "./app/db/jobs.db";

const queue = getQueue(queueDbFile);

function startWorker<JobType extends keyof JobTypes>(jobType: JobType) {
  const worker = new Worker("./app/jobs/worker.ts", { argv: [queueDbFile, jobType] });
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
