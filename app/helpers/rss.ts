import RSS from "rss";
import {db} from "./prisma.server";
import {processMarkdown} from "./processMarkdown";

export async function generateFeed() {
  const feed = new RSS({
    title: "Thorium Nova",
    description:
      "Updates and insights into the Thorium starship bridge simulator.",
    feed_url: "https://thoriumsim.com/feed.xml",
    site_url: "https://thoriumsim.com",
    image_url: "https://thoriumsim.com/favicon.png",
  });

  const posts = await db.post.findMany({
    where: {published: true, publishDate: {lte: new Date()}},
    orderBy: [{publishDate: "desc"}],
    include: {User: {select: {displayName: true}}},
  });

  await Promise.all(
    posts.map(async post => {
      feed.item({
        title: post.title,
        description: post.excerpt || "",
        url: `https://thoriumsim.com/blog/${post.slug}`,
        date: post.publishDate ? new Date(post.publishDate) : new Date(),
        guid: post.slug,
        author: post.User.displayName || "Alex Anderson",
        custom_elements: [
          {
            "content:encoded": await processMarkdown(post?.body || ""),
          },
        ],
      });
    })
  );
  return feed.xml();
}
