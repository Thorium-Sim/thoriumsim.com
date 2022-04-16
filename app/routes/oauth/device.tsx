import { MetaFunction } from "@remix-run/react/routeModules";
import { useEffect, useRef, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { oauthStorage } from "~/oauthSession.server";
import { Button } from "~/components/Button";
import { useUser } from "~/context/user";
import { generateAccessToken } from "~/helpers/generateAccessToken.server";
import { db } from "~/helpers/prisma.server";
import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/server-runtime";
import { getUser } from "~/session.server";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";

export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();
  const user_code = body.get("user_code") as string;

  if (user_code) {
    const deviceRequest = await db.oAuthDeviceRequest.findFirst({
      where: {
        user_code,
        expires_at: {
          gt: new Date(),
        },
      },
      include: {
        OAuthApp: true,
        OAuthDeviceRequestScope: {
          include: {
            OAuthScope: true,
          },
        },
      },
    });
    if (!deviceRequest)
      return {
        error: "",
      };

    return {
      deviceCode: deviceRequest.device_code,
      appName: deviceRequest.OAuthApp?.app_name,
      scopes: deviceRequest.OAuthDeviceRequestScope.map((scope) => ({
        scope: scope.scope,
        description: scope.OAuthScope?.description || "",
      })),
    };
  }
  const choice = body.get("choice");
  const deviceCode = body.get("device_code");
  // Handle denial
  if (choice === "cancel" && deviceCode) {
    // Delete the device request
    await db.oAuthDeviceRequest.deleteMany({
      where: {
        device_code: deviceCode as string,
      },
    });
  } else {
    const user = await getUser(request);
    if (!user) return redirect("/login");
    const deviceRequest = await db.oAuthDeviceRequest.findFirst({
      where: {
        device_code: (deviceCode as string) || "",
      },
      include: {
        OAuthDeviceRequestScope: true,
      },
    });
    if (!deviceRequest)
      return {
        error: "invalid_request",
        error_description: "Device code is invalid or has expired",
      };
    const access_token = generateAccessToken();
    // Update the database - the device will poll to know if it has access
    await db.oAuthAccessToken.create({
      data: {
        user_id: user?.user_id,
        access_token,
        client_id: deviceRequest.client_id,
        OAuthAccessTokenScope: {
          createMany: {
            data: deviceRequest.OAuthDeviceRequestScope.map((scope) => ({
              scope: scope.scope,
            })),
          },
        },
      },
    });
    await db.oAuthDeviceRequest.update({
      data: {
        access_token,
      },
      where: {
        id: deviceRequest.id,
      },
    });
    // Return a response saying we're done.
    return {
      done: true,
    };
  }
  return { error: "invalid_request", error_description: "Invalid request" };
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  const urlParams = new URL(request.url).searchParams;
  const user_code = urlParams.get("user_code");

  const oauthSession = await oauthStorage.getSession();
  oauthSession.set("user_code", user_code);
  if (user_code && !user) {
    const deviceRequest = await db.oAuthDeviceRequest.findFirst({
      where: {
        user_code,
        expires_at: {
          gt: new Date(),
        },
      },
      include: {
        OAuthApp: true,
        OAuthDeviceRequestScope: {
          include: {
            OAuthScope: true,
          },
        },
      },
    });
    if (!deviceRequest)
      return redirect("/login", {
        headers: {
          "set-cookie": await oauthStorage.commitSession(oauthSession),
        },
      });

    return redirect(`/login?appName=${deviceRequest.OAuthApp?.app_name}`, {
      headers: {
        "set-cookie": await oauthStorage.commitSession(oauthSession),
      },
    });
  }

  if (!user)
    return redirect("/login", {
      headers: {
        "set-cookie": await oauthStorage.commitSession(oauthSession),
      },
    });

  oauthSession.unset("user_code");
  return json(
    {
      user_code: urlParams.get("user_code"),
    },
    {
      headers: {
        "set-cookie": await oauthStorage.commitSession(oauthSession),
      },
    }
  );
};

export const meta: MetaFunction = ({ data }) => {
  return {
    title: `Authorize Application`,
  };
};
export default function Device() {
  const action = useActionData();
  const { user_code } = useLoaderData() as {
    user_code: string;
  };
  const user = useUser();
  const [codeInput, setCodeInput] = useState(user_code || "");

  const userCodeRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (user_code) {
      userCodeRef.current?.submit();
    }
  }, [user_code]);
  return (
    <div className="pt-16">
      <div className="mx-auto w-screen max-w-md rounded bg-tgray-600 p-8 shadow-2xl">
        {action?.done ? (
          <p className="text-bold mb-2 text-center text-xl text-gray-200">
            You may now close this window.
          </p>
        ) : !action?.deviceCode ? (
          <>
            <h1 className="mb-4 text-center text-3xl font-extrabold">
              Enter Authorization Code
            </h1>
            <p className="text-center text-sm text-gray-400">
              Enter the code provided to authorize the app.
            </p>
            <Form method="post" ref={userCodeRef}>
              <input
                className="my-4 w-full rounded-lg border border-tgray-100 bg-tgray-500 p-1 text-center text-lg"
                value={codeInput}
                name="user_code"
                onChange={(e) => setCodeInput(e.target.value)}
              ></input>
              <div className="flex justify-end">
                <Button disabled={codeInput.length < 6}>Next</Button>
              </div>
            </Form>
            {action?.error && (
              <p className="text-center text-red-500">
                {action.error_description}
              </p>
            )}
          </>
        ) : (
          <>
            <h1 className="mb-4 text-center text-3xl font-extrabold">
              Authorize {action.appName}
            </h1>

            <>
              <p className="mb-2 text-center text-gray-300">
                {action.appName} wants to access your account.
              </p>
              <p className="text-center text-sm text-gray-400">
                Signed in as{" "}
                <span className="text-gray-200">{user?.email}</span>{" "}
                <Link to="login">Not you?</Link>
              </p>
              <hr className="my-8 border-gray-500" />
              <p className="text-sm font-semibold uppercase text-gray-300">
                This will allow {action.appName} to:
              </p>
              <ul className="my-4 ml-4 space-y-4">
                {action.scopes?.map(
                  ({
                    scope,
                    description,
                  }: {
                    scope: string;
                    description: string;
                  }) => (
                    <li className="flex items-center" key={scope}>
                      <FaCheckCircle className="mr-4 text-xl text-green-500"></FaCheckCircle>{" "}
                      {description}
                    </li>
                  )
                )}
              </ul>
              <hr className="my-8 border-gray-500" />

              <div className="mt-8 flex justify-between">
                <Form method="post" onSubmit={(e) => e.stopPropagation()}>
                  <input type="hidden" name="choice" value="cancel" />
                  <input
                    type="hidden"
                    name="device_code"
                    value={action.deviceCode}
                  />
                  <Button className="bg-red-500 hover:bg-red-600 disabled:bg-red-900">
                    Cancel
                  </Button>
                </Form>
                <Form method="post">
                  <input type="hidden" name="choice" value="authorize" />
                  <input
                    type="hidden"
                    name="device_code"
                    value={action.deviceCode}
                  />
                  <Button>Authorize {action.appName}</Button>
                </Form>
                {action?.error && (
                  <p className="text-center text-red-500">
                    {action.error_description}
                  </p>
                )}
              </div>
            </>
          </>
        )}
      </div>
    </div>
  );
}
