import { Form, useLoaderData, useTransition } from "@remix-run/react";
import {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
  redirect,
} from "@remix-run/server-runtime";
import { FaSpinner } from "react-icons/fa";
import { Input } from "~/components/Input";
import { db } from "~/helpers/prisma.server";
import { commitSession, createUserSession, getSession } from "~/session.server";

export let action: ActionFunction = async ({ request }) => {
  let session = await getSession(request);
  const bodyParams = new URLSearchParams(await request.text());
  const token = bodyParams.get("token");
  try {
    const password = bodyParams.get("password");
    const confirmPassword = bodyParams.get("confirmPassword");
    if (!password) {
      throw new Error("Password is required.");
    }
    if (password !== confirmPassword) {
      throw new Error("Passwords do not match.");
    }
    const user = await db.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpire: {
          gt: new Date(),
        },
      },
    });
    if (!user) {
      throw new Error("Invalid token or token has expired.");
    }
    const { default: bcrypt } = await import("bcryptjs");
    const salt = await bcrypt.genSalt(10);
    // now we set user password to hashed password
    const newPassword = await bcrypt.hash(password, salt);
    const { password: uPassword, ...updatedUser } = await db.user.update({
      where: {
        user_id: user.user_id,
      },
      data: {
        password: newPassword,
        passwordResetToken: null,
        passwordResetExpire: null,
      },
      include: {
        UserRole: { include: { Role: true } },
      },
    });
    session.flash("toast", "Password reset successfully.");
    await createUserSession({
      request,
      userId: updatedUser.user_id,
      remember: true,
      redirectTo: "/",
    });
  } catch (e: unknown) {
    if (e instanceof Error) {
      session.flash("error", e.message);
    }
  } finally {
    return new Response("", {
      status: 302,
      headers: {
        location: `/new-password?token=${token}`,
        "Set-Cookie": await commitSession(session),
      },
    });
  }
};

export const meta: MetaFunction = () => ({
  title: "Password Reset",
});

export const loader: LoaderFunction = async ({ request }) => {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) {
    return redirect("/password-reset");
  }
  let user = await db.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpire: {
        gt: new Date(),
      },
    },
  });
  if (!user) {
    return redirect("/password-reset");
  }
  return { token };
};

export default function PasswordReset() {
  let pendingForm = useTransition().submission;
  let { token } = useLoaderData();
  return (
    <div className="mt-32 flex min-h-full w-full flex-col items-center justify-center">
      <div className="w-full max-w-xl flex-1">
        <h1 className="text-5xl font-bold">New Password</h1>
        <div className="h-16"></div>
        <Form
          className="mb-16 flex flex-col rounded bg-tgray-500 bg-opacity-50 px-8 pt-6 pb-8 shadow-md"
          method="post"
        >
          <input type="hidden" name="token" value={token} />
          <Input
            label="New Password"
            name="password"
            type="password"
            disabled={!!pendingForm}
          />
          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
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
        </Form>
      </div>
    </div>
  );
}
