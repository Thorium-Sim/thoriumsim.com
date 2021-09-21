import {Form, Link, usePendingFormSubmit, useRouteData} from "@remix-run/react";
import {FaSpinner} from "react-icons/fa";
import {ActionFunction, json, LoaderFunction, redirect} from "remix";
import {commitSession, getSession} from "~/auth/localSession.server";
import {Input} from "../../components/Input";
import {db} from "~/helpers/prisma.server";
import {authenticator} from "~/auth/auth.server";

interface SignUpSubmitResults {
  error?: {email?: string; password?: string; displayName?: string};
  email?: string;
  displayName?: string;
}

async function validateCredentials(
  displayName: string | null,
  email: string | null,
  password: string | null
) {
  if (!displayName)
    throw {type: "displayName", message: "Display Name must not be blank."};
  if (!email) throw {type: "email", message: "Email must not be blank."};
  if (!password)
    throw {type: "password", message: "Password must not be blank."};
  if (password.length < 8)
    throw {
      type: "password",
      message: "Password must be at least 8 characters long.",
    };
  const {default: bcrypt} = await import("bcryptjs");
  const salt = await bcrypt.genSalt(10);
  // now we set user password to hashed password
  const newPassword = await bcrypt.hash(password, salt);

  try {
    // First create a new user; this will throw if there is a failure.
    return await db.user.create({
      data: {email, password: newPassword, displayName},
    });
  } catch (err) {
    if (
      err instanceof Error &&
      err.message.includes("Unique constraint failed on the fields: (`email`)")
    ) {
      throw {type: "email", message: "Email address already exists."};
    } else {
      throw err;
    }
  }
}

export let loader: LoaderFunction = async ({request}) => {
  let session = await getSession(request.headers.get("Cookie"));

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

export let action: ActionFunction = async ({request}) => {
  let session = await getSession(request.headers.get("Cookie"));
  let bodyParams = new URLSearchParams(await request.text());
  const email = bodyParams.get("email");
  const displayName = bodyParams.get("displayName");
  try {
    const {password, ...user} = await validateCredentials(
      displayName?.slice(0, 255).trim() || null,
      email?.trim() || null,
      bodyParams.get("password")
    );

    session.set(authenticator.sessionKey, user);
    session.flash("toast", "Signed Up Successfully");
    return redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
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
  let {error, email, displayName} = useRouteData<SignUpSubmitResults>();
  let pendingForm = usePendingFormSubmit();
  return (
    <div className="min-h-full w-full flex flex-col justify-center items-center mt-32">
      <div className="flex-1 max-w-xl w-full">
        <h1 className="font-bold text-5xl">Sign Up</h1>
        <div className="h-16"></div>

        <Form
          className="bg-tgray-500 bg-opacity-50 shadow-md rounded px-8 pt-6 pb-8 mb-16 flex flex-col"
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
              className="bg-thorium-500 hover:bg-thorium-600 disabled:bg-tgray-200 text-white  disabled:cursor-not-allowed font-bold py-2 px-4 rounded"
              type="submit"
              disabled={!!pendingForm}
            >
              {pendingForm ? <FaSpinner className="animate-spin" /> : "Sign In"}
            </button>
          </div>
          <hr className="w-1/2 mx-auto my-8" />
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
