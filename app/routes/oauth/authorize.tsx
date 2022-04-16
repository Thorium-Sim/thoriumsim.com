import { Form, Link, useLoaderData } from "@remix-run/react";
import {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
  redirect,
} from "@remix-run/server-runtime";
import { FaCheckCircle } from "react-icons/fa";
import { Button } from "~/components/Button";
import { useUser } from "~/context/user";
import { getUser } from "~/session.server";

export const scopeDescriptions = {
  email: "Access your email address.",
  identity: "Access your name, bio, and profile picture.",
  "github:issues": "Post issues to Github on your behalf.",
};
export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();

  const choice = body.get("choice");
  // Handle denial

  // Generate the authorization code as a JWT
  // https://www.oauth.com/oauth2-servers/authorization/the-authorization-response/

  // Redirect to the redirect URI - include the authorization code and stored state
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  if (!user) return redirect("/oauth/login");

  const urlParams = new URL(request.url).searchParams;
  // Check to make sure it has a valid response type

  // Check to make sure there is a valid client ID

  // Check to make sure there is a valid redirect URI

  // Hang on to the state value so it can be passed back to the client

  // Verify the code challenge https://www.oauth.com/oauth2-servers/pkce/authorization-request/

  return {
    appName: "Test",
    scopes: ["email"],
    redirectUrl: "https://thoriumsim.com",
  };
};

export const meta: MetaFunction = ({ data }) => {
  return {
    title: `Authorize ${data.appName}`,
  };
};
export default function Authorize() {
  const { appName, scopes, redirectUrl } = useLoaderData() as {
    appName: string;
    redirectUrl: string;
    scopes: (keyof typeof scopeDescriptions)[];
  };
  const user = useUser();
  return (
    <div className="pt-16">
      <div className="mx-auto w-screen max-w-md rounded bg-tgray-600 p-8 shadow-2xl">
        <h1 className="mb-4 text-center text-3xl font-extrabold">
          Authorize {appName}
        </h1>
        <p className="mb-2 text-center text-gray-300">
          {appName} wants to access your account.
        </p>
        <p className="text-center text-sm text-gray-400">
          Signed in as <span className="text-gray-200">{user?.email}</span>{" "}
          <Link to="login">Not you?</Link>
        </p>
        <hr className="my-8 border-gray-500" />
        <p className="text-sm font-semibold uppercase text-gray-300">
          This will allow {appName} to:
        </p>
        <ul className="my-4 ml-4 space-y-4">
          {scopes?.map((scope) => (
            <li className="flex items-center" key={scope}>
              <FaCheckCircle className="mr-4 text-xl text-green-500"></FaCheckCircle>{" "}
              {scopeDescriptions[scope]}
            </li>
          ))}
        </ul>
        <hr className="my-8 border-gray-500" />

        <p className="text-center text-sm text-gray-400">
          Once you authorize, you will be redirected to{" "}
          <span className="font-bold text-gray-200">{redirectUrl}</span>.
        </p>
        <div className="mt-8 flex justify-between">
          <Form method="post">
            <input type="hidden" name="choice" value="cancel" />
            <Button className="bg-red-500 hover:bg-red-600 disabled:bg-red-900">
              Cancel
            </Button>
          </Form>
          <Form method="post">
            <input type="hidden" name="choice" value="authorize" />
            <Button>Authorize {appName}</Button>
          </Form>
        </div>
      </div>
    </div>
  );
}
