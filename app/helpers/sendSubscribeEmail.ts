import getEmailContent from "~/components/EmailTemplate";
import {emailSender} from "./email";

export default async function sendSubscribeEmail(email: string) {
  const html = await getEmailContent(
    `Hey there! Alex here.

Thanks for subscribing to updates for Thorium Nova. I'm really excited about this project, and I'm glad to have you along for the ride!

First things first, you need to click the link below to confirm your subscription.

[Confirm your subscription](https://thoriumsim.com/email/confirmSubscription?email=${email})

Next, reply to this email and share a bit about yourself. How did you come across Thorium Nova? Why did you sign up for the newsletter? And what are you most excited for in Thorium Nova?

You can expect these newsletter updates every so often on Thorium Thursdays. I’ll be writing about different parts of Thorium Nova as well as asking you questions and getting your feedback. Feel free to reply to any of these emails to contact me directly. I’ll read and respond to every single email you send me - I would love to hear from you. Let me know what you want to hear about, ask me questions, give suggestions - whatever you want.

You can read all of the past emails on the Thorium Nova Blog: https://thoriumsim.com/blog

Also, you can use this link to join the Thorium Discord server: https://discord.com/invite/BxwXaUB

It's great to have you with us!`,
    email,
    0
  );
  await emailSender.sendMail({
    replyTo: "hey@thoriumsim.com",
    to: email,
    from: '"Alex from Thorium" hey@thoriumsim.com',
    subject: "Confirm your Thorium Nova subscription 🚀",
    html,
  });
}
