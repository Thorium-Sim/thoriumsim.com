import { defineWorker } from "@thorium-sim/plainjob";
import { sendEmail } from "../utils/email.tsx";
import { jobLogger } from "./logger.ts";
import { sendNewsletter } from "./newsletterSend.ts";
import { getQueue } from "./queue.ts";
import type { JobTypes } from "./types.ts";

export const queueDbFile = "./app/db/jobs.db";

const queue = getQueue(queueDbFile);

function startWorker<JobType extends keyof JobTypes>(jobType: JobType) {
  defineWorker(
    jobType,
    async (job) => {
      switch (job.type) {
        case "sendEmail":
          if (!job.data) return;
          await sendEmail(job.data);
          break;
        case "newsletterSend":
          await sendNewsletter(queue);
          break;
        default:
          console.error("Invalid job type:", job.type);
      }
    },
    {
      pollIntervall: 5000,
      queue,
      logger: jobLogger,
    },
  )
    .start()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });

  console.info(`${jobType} worker started`);

}

let started = false;
export function startJobs() {
  if (started) return;
  console.info("Starting workers...")
  startWorker("sendEmail");
  startWorker("newsletterSend");
  queue.schedule("newsletterSend", { cron: "*/60 * * * *" });
  started = true;
}
