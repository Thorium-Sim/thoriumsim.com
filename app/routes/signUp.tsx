import { Form, Link, useTransition, useLoaderData } from "@remix-run/react";
import { FaSpinner } from "react-icons/fa";
import { Input } from "~/components/Input";
import { validateCredentials } from "~/helpers/validateCredentials";
import {
  ActionFunction,
  LoaderFunction,
  redirect,
} from "@remix-run/server-runtime";
import { json } from "remix-utils";
import { commitSession, createUserSession, getSession } from "~/session.server";

interface SignUpSubmitResults {
  error?: { email?: string; password?: string; displayName?: string };
  email?: string;
  displayName?: string;
}

export let loader: LoaderFunction = async ({ request }) => {
  let session = await getSession(request);

  if (session.has("user")) {
    // Redirect to the home page if they are already signed in.
    return redirect("/");
  }

  let data = {
    error: session.get("error"),
    email: session.get("email"),
    displayName: session.get("displayName"),
  };

  return json(data, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export let action: ActionFunction = async ({ request }) => {
  let session = await getSession(request);
  let bodyParams = new URLSearchParams(await request.text());
  const email = bodyParams.get("email");
  const displayName = bodyParams.get("displayName");
  try {
    const { password, ...user } = await validateCredentials(
      displayName?.slice(0, 255).trim() || null,
      email?.trim() || null,
      bodyParams.get("password")
    );

    session.flash("toast", "Signed Up Successfully");
    return createUserSession({
      request,
      userId: user.user_id,
      remember: true,
      redirectTo: "/",
    });
  } catch (e: any) {
    session.flash("error", {
      [e.type || "password"]: e.message || "Invalid username/password",
    });

    session.flash("email", email);
    session.flash("displayName", displayName);

    // Redirect back to the login page with errors.
    return redirect("/signUp", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }
};

export default function SignUp() {
  let { error, email, displayName } = useLoaderData<SignUpSubmitResults>();
  let pendingForm = useTransition().submission;
  return (
    <div className="mt-32 flex min-h-full w-full flex-col items-center justify-center">
      <div className="w-full max-w-xl flex-1 px-4">
        <h1 className="text-5xl font-bold">Sign Up</h1>
        <div className="h-16"></div>

        <Form
          className="mb-16 flex flex-col rounded bg-tgray-500 bg-opacity-50 px-8 pt-6 pb-8 shadow-md"
          method="post"
        >
          <Input
            label="Display Name"
            type="text"
            name="displayName"
            defaultValue={displayName}
            error={error?.displayName}
            disabled={!!pendingForm}
          />
          <Input
            label="Email"
            type="email"
            name="email"
            defaultValue={email}
            error={error?.email}
            disabled={!!pendingForm}
          />
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="******************"
            error={error?.password}
            disabled={!!pendingForm}
          />
          <div className="flex items-center justify-end">
            <button
              className="rounded bg-thorium-500 py-2 px-4  font-bold text-white hover:bg-thorium-600 disabled:cursor-not-allowed disabled:bg-tgray-200"
              type="submit"
              disabled={!!pendingForm}
            >
              {pendingForm ? <FaSpinner className="animate-spin" /> : "Sign In"}
            </button>
          </div>
          <hr className="mx-auto my-8 w-1/2" />
          <p className="text-center">
            Have an account?{" "}
            <Link
              to="/login"
              className="text-thorium-500 hover:text-thorium-700"
            >
              Sign In
            </Link>
          </p>
        </Form>
      </div>
    </div>
  );
}
