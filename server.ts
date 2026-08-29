// Production server — serves the built fetch handler with Bun.
// Build first (`bun run build`), then start with `bun server.ts`.
// @ts-expect-error - built output has no types
import ssr from "./dist/ssr/index.js";

let server = Bun.serve({
  port: process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 44100,
  fetch: (request) => ssr.fetch(request),
});

console.info(`Server running at ${server.url.href}`);

let shuttingDown = false;

async function shutdown() {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  server.closeIdleConnections();
  await server.stop();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
