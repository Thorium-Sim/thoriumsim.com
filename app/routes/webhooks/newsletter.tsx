import getEmailContent from "~/components/EmailTemplate";
import { emailSender } from "~/helpers/email";
import { db } from "~/helpers/prisma.server";
import { RateLimiter } from "limiter";
import { json } from "remix-utils";
import {
  ActionFunction,
  LoaderFunction,
  redirect,
} from "@remix-run/server-runtime";
const awsLimiter = new RateLimiter({ interval: "sec", tokensPerInterval: 70 });
export const action: ActionFunction = async ({ request }) => {
  try {
    const newslettersToBeSent = await db.post.findMany({
      // If it has a newsletter date of any kind, it's allowed to be sent, even if it isn't published
      // Published only applies to blog posts, not newsletters.
      where: {
        newsletterDate: { lte: new Date() },
        newsletterSent: { equals: false },
      },
      include: {
        PostSubscriberTag: {
          include: {
            SubscriberTag: {
              include: {
                SubscriberTagLookup: {
                  include: {
                    Subscriber: { select: { email: true, status: true } },
                  },
                },
              },
            },
          },
        },
      },
    });
    const activeSubscribers = (
      await db.subscriber.findMany({
        where: { status: { equals: "active" } },
      })
    ).map((s) => s.email);
    const result = await Promise.allSettled(
      newslettersToBeSent.map(async (post) => {
        let emails: string[] = [];
        if (!post.body) return;
        try {
          emails =
            post.PostSubscriberTag.length === 0
              ? activeSubscribers
              : post.PostSubscriberTag.reduce((acc: string[], pst) => {
                  pst.SubscriberTag?.SubscriberTagLookup.forEach((t) => {
                    // If we are using a subscriber tag, ignore the subscription status.
                    // This allows us to send emails to specific users without them being subscribed to the newsletter.
                    // TODO: Make it so subscriptions to the newsletter are handled in a separate table maybe.
                    if (t.Subscriber) acc.push(t.Subscriber.email);
                  });
                  return acc;
                }, []);
        } catch (err) {
          throw new Error("Error collecting email list.");
        }
        await db.post.update({
          where: { post_id: post.post_id },
          data: { newsletterSent: true },
        });
        let sentEmail: string[] = [];
        for (let email of emails) {
          try {
            await awsLimiter.removeTokens(1);
            await emailSender.sendMail({
              replyTo: "hey@thoriumsim.com",
              to: email,
              from: '"Alex from Thorium" hey@thoriumsim.com',
              subject: `Thorium Nova - ${post.title}`,
              html: await getEmailContent(post.body, email, post.post_id),
            });
            sentEmail.push(email);
          } catch (err) {
            if (err instanceof Error) {
              throw new Error(
                `Error sending email to ${email}: ${err.message}`
              );
            }
          }
        }
        await db.$transaction(
          sentEmail.map((email) =>
            db.newsletterSubscriberSends.create({
              data: {
                subscriber_email: email,
                post_id: post.post_id,
              },
            })
          )
        );
      })
    );
    const rejected = result.filter((r) => r.status === "rejected");
    if (rejected.length > 0) {
      await awsLimiter.removeTokens(1);

      await emailSender.sendMail({
        replyTo: "hey@thoriumsim.com",
        to: "alex@thoriumsim.com",
        from: '"Alex from Thorium" hey@thoriumsim.com',
        subject: `Error sending emails`,
        html: `<p>There was an error sending emails:</p><pre>${JSON.stringify(
          rejected,
          null,
          2
        )}</pre>`,
      });
    }
    return json({ success: true }, { status: 200 });
  } catch (err) {
    return json({ success: false }, { status: 400 });
  }
};
export const loader: LoaderFunction = () => {
  return redirect("/");
};
export default function Newsletter() {
  return null;
}
