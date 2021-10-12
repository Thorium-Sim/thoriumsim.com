import {Form, useTransition, Link, useLoaderData} from "@remix-run/react";
import {FaSpinner} from "react-icons/fa";
import {ActionFunction, json, LoaderFunction, redirect} from "remix";
import {authenticator} from "~/auth/auth.server";
import {commitSession, getSession} from "~/auth/localSession.server";
import {Input} from "../../components/Input";

interface LoginSubmitResults {
  emailError?: string;
  passwordError?: string;
  email?: string;
}
export let loader: LoaderFunction = async ({request}) => {
  let session = await getSession(request.headers.get("Cookie") || "");

  if (session.has(authenticator.sessionKey)) {
    // Redirect to the home page if they are already signed in.
    return redirect("/");
  }
  let data = {
    emailError:
      session.get("auth:local:error:user") || session.get("auth:local:error"),
    passwordError: session.get("auth:local:error:pass"),
    email: session.get("email"),
  };

  return json(data, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export let action: ActionFunction = async ({request}) => {
  // let bodyParams = new URLSearchParams(await request.text());
  // const email = bodyParams.get("email");

  return authenticator.authenticate(
    "local",
    request,
    async ({password, ...user}) => {
      let session = await getSession(request.headers.get("Cookie"));
      session.set(authenticator.sessionKey, user);
      session.flash("toast", "Logged In Successfully");
      return redirect("/", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }
  );
};

export default function Login() {
  let {emailError, passwordError, email} = useLoaderData<LoginSubmitResults>();
  let pendingForm = useTransition().submission;

  return (
    <div className="min-h-full w-full flex flex-col justify-center items-center mt-32">
      <div className="flex-1 max-w-xl w-full">
        <h1 className="font-bold text-5xl">Login</h1>
        <div className="h-16"></div>
        <Form
          className="bg-tgray-500 bg-opacity-50 shadow-md rounded px-8 pt-6 pb-8 mb-16 flex flex-col"
          method="post"
        >
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
            <a
              className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-700"
              href="#"
            >
              Forgot Password?
            </a>
            <button
              className="bg-thorium-500 hover:bg-thorium-600 disabled:bg-tgray-200 text-white  disabled:cursor-not-allowed font-bold py-2 px-4 rounded"
              type="submit"
              disabled={!!pendingForm}
            >
              {pendingForm ? <FaSpinner className="animate-spin" /> : "Sign In"}
            </button>
          </div>
          <hr className="w-1/2 mx-auto my-8" />
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
