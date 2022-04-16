import { FaSpinner } from "react-icons/fa";
import { Input } from "~/components/Input";
import { db } from "~/helpers/prisma.server";
import { hash } from "bcryptjs";
import { emailSender } from "~/helpers/email";
import {
  ActionFunction,
  MetaFunction,
  redirect,
} from "@remix-run/server-runtime";
import { commitSession, getSession } from "~/session.server";
import { Form, Link, useTransition } from "@remix-run/react";

export let action: ActionFunction = async ({ request }) => {
  let session = await getSession(request);
  try {
    let bodyParams = new URLSearchParams(await request.text());
    const email = bodyParams.get("email");
    if (!email) throw new Error("Email is required");
    const user = await db.user.findFirst({ where: { email } });
    if (!user) throw new Error("User not found");
    const token = await hash(Math.random().toString(), 10);
    await db.user.update({
      where: { user_id: user.user_id },
      data: {
        passwordResetToken: token,
        passwordResetExpire: new Date(Date.now() + 1000 * 60 * 60),
      },
    });
    emailSender.sendMail({
      to: email,
      from: '"Alex from Thorium" hey@thoriumsim.com',
      subject: "Reset your password",
      html: `
    <p>
      You have requested to reset your password.
    </p>
    <p>
      <a href="https://thoriumsim.com/new-password?token=${token}">Click here to reset your password</a>
    </p>
    <p>
      If you did not request to reset your password, please ignore this email.
    </p>
    <p>
      Thanks,
      <br />
      Alex
    </p>
    `,
    });
    session.flash("toast", "Check your email inbox for reset instructions.");
  } catch (e: unknown) {
    if (e instanceof Error) {
      session.flash("error", e.message);
    }
  } finally {
    return redirect("/password-reset", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }
};

export const meta: MetaFunction = () => ({
  title: "Password Reset",
});

export default function PasswordReset() {
  let pendingForm = useTransition().submission;

  return (
    <div className="mt-32 flex min-h-full w-full flex-col items-center justify-center">
      <div className="w-full max-w-xl flex-1">
        <h1 className="text-5xl font-bold">Reset your Password</h1>
        <div className="h-16"></div>
        <Form
          className="mb-16 flex flex-col rounded bg-tgray-500 bg-opacity-50 px-8 pt-6 pb-8 shadow-md"
          method="post"
        >
          <Input
            label="Email"
            type="email"
            name="email"
            disabled={!!pendingForm}
          />

          <div className="flex items-center justify-end">
            <button
              className="rounded bg-thorium-500 py-2 px-4   font-bold text-white hover:bg-thorium-700 disabled:cursor-not-allowed disabled:bg-tgray-200"
              type="submit"
              disabled={!!pendingForm}
            >
              {pendingForm ? <FaSpinner className="animate-spin" /> : "Sign In"}
            </button>
          </div>
          <hr className="mx-auto my-8 w-1/2" />
          <p className="text-center">
            Jogged your memory?{" "}
            <Link
              to="/login"
              className="text-thorium-500 hover:text-thorium-700"
            >
              Sign Up
            </Link>
          </p>
        </Form>
      </div>
    </div>
  );
}
