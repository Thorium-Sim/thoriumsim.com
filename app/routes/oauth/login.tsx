import { MetaFunction } from "@remix-run/react/routeModules";
import { FaDiscord, FaGithub, FaSpinner } from "react-icons/fa";
import { oauthStorage } from "~/oauthSession.server";
import { Input } from "~/components/Input";
import { SignInButton } from "~/components/SignInButton";
import {
  ActionFunction,
  LoaderFunction,
  redirect,
} from "@remix-run/server-runtime";
import { createUserSession, getSession, getUser } from "~/session.server";
import { Form, Link, useLoaderData, useTransition } from "@remix-run/react";

interface LoginSubmitResults {
  emailError?: string;
  passwordError?: string;
  email?: string;
}

export let action: ActionFunction = async ({ request }) => {
  let bodyParams = new URLSearchParams(await request.clone().text());
  const email = bodyParams.get("email");
  const result = await getUser(request);
  if (!result || !result.user_id) return redirect("/oauth/login");
  let session = await getSession(request);
  let oauthSession = await oauthStorage.getSession(
    request.headers.get("Cookie")
  );

  session.flash("toast", "Logged In Successfully");
  session.flash("email", email);
  return createUserSession({
    request,
    userId: result.user_id,
    remember: true,
    redirectTo: `/oauth/device?user_code=${oauthSession.get("user_code")}`,
  });
};

export let loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const appName = url.searchParams.get("appName") || ("this app" as string);
  const user = await getUser(request);
  if (user) return redirect("/oauth/authorize");

  let session = await getSession(request);
  const errorMessage = session.get("auth:local:error") as {
    message: string;
  } | null;

  if (errorMessage?.message) {
    if (errorMessage.message.includes("password"))
      return {
        passwordError: errorMessage.message,
        email: session.get("email"),
        appName,
      };
    return {
      emailError: errorMessage.message,
      email: session.get("email"),
      appName,
    };
  }
  return { appName };
};

export const meta: MetaFunction = ({ data }) => {
  return {
    title: `Login to Authorize ${data.appName}`,
  };
};
export default function Authorize() {
  let { emailError, passwordError, email, appName } = useLoaderData<
    LoginSubmitResults & {
      appName: string;
    }
  >();
  let pendingForm = useTransition().submission;

  return (
    <div className="pt-16">
      <div className="mx-auto w-screen max-w-md rounded bg-tgray-600 p-8 shadow-2xl">
        <h1 className="mb-4 text-center text-3xl font-extrabold">
          Login to Thorium to Authorize {appName}
        </h1>
        <p className="mb-2 text-center text-gray-300">
          {appName} wants to access your account.
          <br />
          You must first log in.
        </p>
        <Form method="post">
          <Input
            label="Email"
            type="email"
            name="email"
            defaultValue={email}
            error={emailError}
            disabled={!!pendingForm}
          />
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="******************"
            error={passwordError}
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
              {pendingForm ? <FaSpinner className="animate-spin" /> : "Sign In"}
            </button>
          </div>
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
        </Form>
      </div>
    </div>
  );
}
