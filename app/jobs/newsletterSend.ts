import { getPostRaw, listPostsRaw } from "../utils/r2.ts";
import { db } from "../db.ts";
import { newsletterSubscriberSends, post, subscriber, user } from "../db/tables.ts";
import { query } from "remix/data-table";
import { getEmailContent } from "../utils/email.tsx";
import { processMarkdown } from "../utils/processMarkdown.ts";
import type { Queue } from "@thorium-sim/plainjob";
import type { JobTypes } from "./types.ts";

export async function sendNewsletter(queue: Queue<JobTypes>) {
  console.info("Checking for newsletters to send");
  // First get all of the current posts. We'll want to bypass the cache.
  const posts = await listPostsRaw();
  // Then get all of our stored posts
  const storedPosts = await db.exec(query(post).select("post_id", "slug"));
  const storedSlugs = storedPosts.map((p) => p.slug);
  // If there are any posts that aren't already stored (meaning sent) check if there are any frontmatter tags preventing it from being sent now
  const postsToSend = posts.filter(
    (p) => p.publishedAt <= Date.now() && !storedSlugs.includes(p.slug) && !p.noNewsletter,
  );

  // Get all of our current subscribers. We do not care about subscriber tags right now, so ignore them.
  const subscribers = await db.exec(
    query(subscriber).select("subscriber_id", "email").where({ status: "active" }),
  );

  const authorUser = await db.findOne(user, { where: { email: "alex@thoriumsim.com" } });

  console.info(`Sending ${postsToSend.length} posts to ${subscribers.length} subscribers.`);

  // Send the email to the subscribers
  const result = await Promise.allSettled(
    postsToSend.map(async (sendingPost) => {
      const postBody = (await getPostRaw(sendingPost.slug)).raw;
      // Create the post sent record
      const createdPost = await db.create(
        post,
        {
          slug: sendingPost.slug,
          excerpt: sendingPost.excerpt,
          title: sendingPost.title,
          featuredImageUrl: sendingPost.coverImageUrl,
          publishDate: Date.now(),
          published: true,
          body: postBody,
          newsletterDate: Date.now(),
          newsletterSent: true,
          user_id: authorUser?.user_id,
        },
        { returnRow: true },
      );
      const result = await Promise.allSettled(
        subscribers.map(async (sub) => {
          const email = sub.email;
          try {
            queue.add("sendEmail", {
              replyTo: ["hey@thoriumsim.com"],
              to: email,
              from: '"Alex from Thorium" hey@thoriumsim.com',
              subject: `Thorium Nova - ${sendingPost.title}`,
              text: (
                await processMarkdown(
                  `${postBody}\n\n[Unsubscribe](https://thoriumsim.com/email/unsubscribe?email=${email})\n\n120 E. Orem, UT 84057`,
                  { plain: true },
                )
              ).html,
              html: await getEmailContent(postBody, email, createdPost.post_id),
            });
            return email;
          } catch (err) {
            if (err instanceof Error) {
              throw new Error(`Error sending email to ${email}: ${err.message}`);
            }
          }
        }),
      );

      // Create a newsletter send record
      await db.createMany(
        newsletterSubscriberSends,
        result.flatMap((m) =>
          m.status === "rejected"
            ? []
            : { post_id: createdPost.post_id, subscriber_email: m.value },
        ),
      );
    }),
  );
  if (postsToSend.length > 0) {
    console.info("Posts sent.", result[0].status === "rejected" ? result[0].reason : "");
  }
}
