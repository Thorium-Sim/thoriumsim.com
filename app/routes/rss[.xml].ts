import { Response } from "@remix-run/node";
import { generateFeed } from "~/helpers/rss";

const cache = { feed: "", setTime: 0 };

export async function loader() {
  if (!cache.feed || Date.now() - cache.setTime > 1000 * 60 * 60 * 24) {
    const rss = await generateFeed();
    cache.feed = rss;
    cache.setTime = Date.now();
  }
  return new Response(cache.feed, {
    headers: { "content-type": "application/rss+xml" },
  });
}
