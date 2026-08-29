import { AwsClient } from "aws4fetch";
import { getEnv } from "./env.ts";
import { cachified } from "@epic-web/cachified";
import matter from "@11ty/gray-matter";
import { processMarkdown } from "./processMarkdown.ts";
import { cache } from "./cache.ts";
const env = getEnv();

const client = new AwsClient({
  secretAccessKey: env.CLOUDFLARE_SECRET_ACCESS_KEY,
  accessKeyId: env.CLOUDFLARE_ACCESS_KEY_ID,
  service: "s3",
  region: "auto",
});

const ENDPOINT = `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/${env.CLOUDFLARE_R2_BUCKET}`;

export async function putFile(body: any, key: string, contentType: string) {
  await client.fetch(`${ENDPOINT}/${key}`, {
    method: "PUT",
    headers: {
      "If-None-Match": "*",
      "Content-Type": contentType,
    },
    body,
  });
}

export async function listPosts() {
  return cachified({
    key: "blog:slugs",
    cache,
    ttl: 30_000, // fresh for 30s
    staleWhileRevalidate: 1000 * 60 * 60 * 24, // serve stale up to 1 day while refetching in bg
    getFreshValue: listPostsRaw,
  });
}

export async function listPostsRaw() {
  let keyList: string[] = [];
  let continuationToken = "";
  while (true) {
    const xml = await (
      await client.fetch(
        `${ENDPOINT}?list-type=2&prefix=posts${continuationToken ? `&continuation-token=${continuationToken}` : ""}`,
      )
    ).text();

    for (const [, match] of xml.matchAll(/<Key>(.+?)<\/Key>/g)) {
      if (match.endsWith("post.md"))
        keyList.push(match.replace("posts/", "").replace("/post.md", ""));
    }
    const continuationMatch = xml.match(/<NextContinuationToken>(.*)<\/NextContinuationToken>/);
    if (!continuationMatch) break;
    continuationToken = continuationMatch[1];
  }
  const postData = await Promise.all(
    keyList.map(async (key) => {
      const postText = await fetch(`https://assets.thoriumsim.com/posts/${key}/post.md`).then(
        (res) => res.text(),
      );
      const frontmatter = matter(postText);
      const { data } = frontmatter;
      return {
        slug: key,
        title: data.title,
        excerpt: data.excerpt,
        publishedAt: data.publishedAt,
        coverImageUrl: data.coverImageUrl,
        noNewsletter: Boolean(data.noNewsletter),
      };
    }),
  );
  postData.sort((a, b) => b.publishedAt - a.publishedAt);
  return postData;
}

export async function getPost(slug: string) {
  return cachified({
    key: `blog:post:${slug}`,
    cache,
    ttl: 60_000,
    staleWhileRevalidate: 1000 * 60 * 60 * 24,
    getFreshValue: () => getPostRaw(slug),
  });
}

export function getAboutContent() {
  return cachified({
    cache,
    key: "about",
    ttl: 60_000, // 1 minute
    staleWhileRevalidate: 300_000, // 5 minutes
    async getFreshValue() {
      const res = await client.fetch(`${ENDPOINT}/aboutContent.md`);
      if (!res.ok) throw new Error(`About Content not found`);
      const raw = await res.text();

      return await processMarkdown(raw);
    },
  });
}

export async function getPostRaw(slug: string) {
  const res = await client.fetch(`${ENDPOINT}/posts/${slug}/post.md`);
  if (!res.ok) throw new Error(`Post not found: ${slug}`);
  const raw = await res.text();
  const { data, content } = matter(raw);
  const { html } = await processMarkdown(content);

  return {
    slug,
    title: data.title,
    excerpt: data.excerpt,
    publishedAt: data.publishedAt,
    coverImageUrl: data.coverImageUrl,
    raw: content,
    html,
  };
}
