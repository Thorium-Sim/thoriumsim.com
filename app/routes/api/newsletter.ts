import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { ActionFunction, redirect } from "@remix-run/server-runtime";
import { db } from "~/helpers/prisma.server";
import sendSubscribeEmail from "~/helpers/sendSubscribeEmail";
import { commitSession, getSession } from "~/session.server";

export let action: ActionFunction = async ({ request }) => {
  const body = new URLSearchParams(await request.text());
  const email = body.get("email_address");
  const name = body.get("first_name");
  let session = await getSession(request);

  // Basic bot protection
  if (name) {
    session.flash("error", "You shouldn't fill in that field. Are you a bot?");
    return redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }
  if (!email) {
    session.flash("error", "Invalid email address.");
  } else {
    try {
      try {
        await db.subscriber.create({
          data: {
            email,
            status: "pending",
          },
        });
      } catch (err) {
        if (err instanceof PrismaClientKnownRequestError) {
          if (err.code === "P2002") {
            session.flash("error", "You are already subscribed.");
          }
          return redirect("/", {
            headers: {
              "Set-Cookie": await commitSession(session),
            },
          });
        }
      }
      await sendSubscribeEmail(email);
      session.flash("newsletter-signup", true);
    } catch (err) {
      if (err instanceof Error) {
        session.flash("error", err.message);
      }
    }
  }
  return redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};
