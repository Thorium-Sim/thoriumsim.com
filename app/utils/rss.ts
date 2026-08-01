import RSS from "rss";
import { getPost, listPosts } from "./r2.ts";

export async function generateFeed() {
  const feed = new RSS({
    title: "Thorium Nova",
    description: "Updates and insights into the Thorium starship bridge simulator.",
    feed_url: "https://thoriumsim.com/feed.xml",
    site_url: "https://thoriumsim.com",
    image_url: "https://thoriumsim.com/favicon.svg",
  });

  const posts = await listPosts();

  await Promise.all(
    posts.map(async (post) => {
      const { html } = await getPost(post.slug);
      feed.item({
        title: post.title,
        description: post.excerpt || "",
        url: `https://thoriumsim.com/blog/${post.slug}`,
        date: post.publishedAt ? new Date(post.publishedAt) : new Date(),
        guid: post.slug,
        author: "Alex Anderson",
        custom_elements: [
          {
            "content:encoded": html,
          },
        ],
      });
    }),
  );
  return feed.xml();
}
