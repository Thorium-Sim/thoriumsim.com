import { query } from "remix/data-table";
import { db } from "../db.ts";
import { subscriber, subscriberEmailOpen } from "../db/tables.ts";
import { verifyTurnstileToken } from "./turnstile.ts";
import { getQueue } from "../jobs/queue.ts";
import { queueDbFile } from "../jobs/startJobs.ts";
import { processMarkdown } from "./processMarkdown.ts";
import { getEmailContent } from "./email.tsx";

export async function trackEmailOpen(email: string | null, broadcastId: string | null) {
  if (!email || !broadcastId) return;
  const sub = await db.findOne(subscriber, { where: { email } });
  if (!sub) return;
  const existingOpen = await db.findOne(subscriberEmailOpen, {
    where: { broadcast_id: Number(broadcastId), subscriber_id: sub.subscriber_id },
  });
  if (existingOpen) return;
  await db.create(subscriberEmailOpen, {
    broadcast_id: Number(broadcastId),
    subscriber_id: sub.subscriber_id,
  });
}

export async function confirmSubscription(email: string, subscribeToken: string) {
  if (!email || !subscribeToken) return;
  const existing = await db.findOne(subscriber, { where: { email, subscribeToken } });
  if (!existing) throw new Error("Subscriber not found.");
  await db.exec(query(subscriber).where({ email }).update({ status: "active" }));
}

export async function unsubscribe(email: string) {
  if (!email) return;

  await db.exec(query(subscriber).where({ email }).update({ status: "unsubscribed" }));
}

function subscriptionConfirmationEmail(email: string, token: string) {
  return `Hey there! Alex here.

Thanks for subscribing to updates for Thorium Nova. I'm really excited about this project, and I'm glad to have you along for the ride!

First things first, you need to click the link below to confirm your subscription. Otherwise you won't get any newsletter emails from me.

[Confirm your subscription](https://thoriumsim.com/email/confirmSubscription?email=${email}&subscribeToken=${token})

Next, reply to this email and share a bit about yourself. How did you come across Thorium Nova? Why did you sign up for the newsletter? And what are you most excited for in Thorium Nova?

You can expect these newsletter updates every so often on Thorium Thursdays. I’ll be writing about different parts of Thorium Nova as well as asking you questions and getting your feedback. Feel free to reply to any of these emails to contact me directly. I’ll read and respond to every single email you send me - I would love to hear from you. Let me know what you want to hear about, ask me questions, give suggestions - whatever you want.

You can read all of the past emails on the Thorium Nova Blog: https://thoriumsim.com/blog

Also, you can use this link to join the Thorium Discord server: https://discord.com/invite/BxwXaUB

It's great to have you with us!`;
}

export async function subscribe(email: string, turnstileToken: string) {
  if (!email) throw new Error("Email is required.");
  if (!turnstileToken) throw new Error("Captcha not completed successfully. Try again.");

  await verifyTurnstileToken(turnstileToken);

  const subscribeToken = crypto.randomUUID();
  try {
    const existing = await db.findOne(subscriber, { where: { email } });
    if (existing && existing.status === "unsubscribed") {
      await db.update(subscriber, existing.subscriber_id, { subscribeToken, status: "pending" });
    } else {
      await db.create(subscriber, { email, subscribeToken, status: "pending" });
    }
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.cause instanceof Error &&
        error.cause.message === "UNIQUE constraint failed: Subscriber.email"
      ) {
        throw new Error(`${email} is already subscribed.`);
      }
    }
    console.error(error);
    throw new Error("There was an error subscribing. Reload and try again.");
  }

  getQueue(queueDbFile).add("sendEmail", {
    replyTo: ["hey@thoriumsim.com"],
    to: email,
    from: '"Alex from Thorium" hey@thoriumsim.com',
    subject: `Confirm your Thorium Nova subscription 🚀`,
    text: (
      await processMarkdown(
        `${subscriptionConfirmationEmail(email, subscribeToken)}\n\n[Unsubscribe](https://thoriumsim.com/email/unsubscribe?email=${email})\n\n120 E. Orem, UT 84057`,
        { plain: true },
      )
    ).html,
    html: await getEmailContent(subscriptionConfirmationEmail(email, subscribeToken), email),
  });
}
