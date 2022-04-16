import {
  Form,
  useTransition,
  Link,
  useLoaderData,
  useActionData,
} from "@remix-run/react";
import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/server-runtime";
import { useEffect, useRef } from "react";
import { FaDiscord, FaGithub, FaSpinner } from "react-icons/fa";
import { Input } from "~/components/Input";
import { SignInButton } from "~/components/SignInButton";
import { verifyLogin } from "~/models/user.server";
import { oauthStorage } from "~/oauthSession.server";
import { createUserSession, getSession, getUser } from "~/session.server";
import { validateEmail } from "~/utils";

interface LoginSubmitResults {
  emailError?: string;
  passwordError?: string;
  email?: string;
  appName?: string;
}
export let loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const appName = url.searchParams.get("appName");
  let oauthSession = await oauthStorage.getSession(
    request.headers.get("Cookie")
  );
  const user_code = oauthSession.get("user_code");
  const user = await getUser(request);
  if (user && user_code) {
    return redirect(`/oauth/device?user_code=${user_code}`);
  } else if (user) {
    return redirect(`/`);
  }

  return { appName };
};

export let action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  if (!validateEmail(email)) {
    return json({ errors: { email: "Email is invalid" } }, { status: 400 });
  }

  if (typeof password !== "string") {
    return json(
      { errors: { password: "Password is required" } },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return json(
      { errors: { password: "Password is too short" } },
      { status: 400 }
    );
  }

  const user = await verifyLogin(email, password);

  if (!user) {
    return json(
      { errors: { password: "Email or password is incorrect" } },
      { status: 400 }
    );
  }
  let session = await getSession(request);
  session.flash("toast", "Logged In Successfully");
  return createUserSession({
    request,
    userId: user.user_id,
    remember: true,
    redirectTo: "/",
  });
};

interface ActionData {
  errors?: {
    email?: string;
    password?: string;
  };
}

export default function Login() {
  let { appName } = useLoaderData<LoginSubmitResults>();
  let pendingForm = useTransition().submission;

  const actionData = useActionData() as ActionData;
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className="mt-32 flex min-h-full w-full flex-col items-center justify-center">
      <div className="w-full max-w-xl flex-1 px-4">
        {appName ? (
          <h1 className="mb-4 text-center text-3xl font-extrabold">
            Login to Thorium to Authorize {appName}
          </h1>
        ) : (
          <h1 className="text-5xl font-bold">Login</h1>
        )}
        <div className="h-16"></div>
        <div className="mb-16 flex flex-col rounded bg-tgray-500 bg-opacity-50 px-8 pt-6 pb-8 shadow-md">
          <Form method="post">
            <Input
              label="Email"
              type="email"
              name="email"
              error={actionData?.errors?.email}
              ref={emailRef}
              disabled={!!pendingForm}
            />
            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="******************"
              error={actionData?.errors?.password}
              ref={passwordRef}
              disabled={!!pendingForm}
            />
            <div className="flex items-center justify-between">
              <Link
                to="/password-reset"
                className="inline-block align-baseline text-sm font-bold text-thorium-500 hover:text-thorium-600"
              >
                Forgot Password?
              </Link>
              <button
                className="rounded bg-thorium-500 py-2 px-4  font-bold text-white hover:bg-thorium-600 disabled:cursor-not-allowed disabled:bg-tgray-200"
                type="submit"
                disabled={!!pendingForm}
              >
                {pendingForm && !pendingForm?.action.includes("/webhooks") ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </Form>
          <hr className="mx-auto my-8 w-1/2" />
          <div className="space-y-4">
            <SignInButton
              provider="github"
              title="Github"
              icon={<FaGithub />}
              className="bg-warmGray-900 hover:bg-warmGray-800 flex w-full justify-center text-white"
            />
            <span></span>

            <SignInButton
              provider="discord"
              title="Discord"
              icon={<FaDiscord />}
              className="flex w-full justify-center bg-[#5865F2] text-white hover:bg-[#8791f6]"
            />
          </div>
          <hr className="mx-auto my-8 w-1/2" />
          <p className="text-center">
            New here?{" "}
            <Link
              to="/signup"
              className="text-thorium-500 hover:text-thorium-700"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
