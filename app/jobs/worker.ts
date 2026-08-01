import { jobLogger } from "./logger.ts";
import { sendNewsletter } from "./newsletterSend.ts";
import { sendEmail } from "../utils/email.tsx";
import { defineWorker } from "@thorium-sim/plainjob";
import type { JobTypes } from "./types.ts";
import { getQueue } from "./queue.ts";

const filename = process.argv[2];
const jobType = process.argv[3] as keyof JobTypes;

const queue = getQueue(filename);

if (!filename) {
  console.error("Invalid database url specified");
  process.exit(1);
}

if (!jobType) {
  console.error("jobType is required");
  process.exit(1);
}

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
