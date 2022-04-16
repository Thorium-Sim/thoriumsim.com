import { db } from "~/helpers/prisma.server";
import crypto from "crypto";
import {
  ActionFunction,
  json,
  LoaderFunction,
} from "@remix-run/server-runtime";

const allowedLetters = "BCDFGHJKLMNPQRSTVWXZ";

// Generates a random string of length 6 from the allowed letters
function generateUserCode() {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += allowedLetters[Math.floor(Math.random() * allowedLetters.length)];
  }
  return code;
}
export const action: ActionFunction = async ({ request }) => {
  const { client_id, scope } = (await request.json()) as {
    client_id?: string;
    scope?: string;
  };
  const scopesList = scope?.split(" ") || [];

  if (!scopesList || scopesList.length === 0) {
    return json(
      {
        error: "invalid_scope",
        error_description:
          "You must specify access scopes when making this request.",
      },
      {
        status: 400,
        headers: {
          "content-type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Authorization, content-type",
        },
      }
    );
  }
  const app = await db.oAuthApp.findFirst({ where: { client_id } });

  if (!app) {
    return json(
      {
        error: "invalid_client",
        error_description: `Client with ID ${client_id} not found.`,
      },
      {
        status: 401,
        headers: {
          "content-type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Authorization, content-type",
        },
      }
    );
  }

  const allScopes = (await db.oAuthScope.findMany()).map((s) => s.scope);
  const invalidScopes = scopesList?.filter((s) => !allScopes.includes(s)) || [];
  if (invalidScopes.length > 0) {
    return json(
      {
        error: "invalid_scope",
        error_description: `The following scopes are invalid: ${scopesList.join(
          ", "
        )}`,
      },
      {
        status: 400,

        headers: {
          "content-type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Authorization, content-type",
        },
      }
    );
  }

  const device_code = crypto.randomBytes(64).toString("base64");
  const user_code = generateUserCode();
  const expires_in = 60 * 5;
  const interval = 2;

  const deviceRequest = await db.oAuthDeviceRequest.create({
    data: {
      client_id,
      device_code,
      user_code,
      expires_at: new Date(Date.now() + expires_in * 1000),
      OAuthDeviceRequestScope: {
        createMany: {
          data: scopesList.map((s) => ({
            scope: s,
          })),
        },
      },
    },
  });
  return json(
    {
      device_code,
      user_code,
      expires_in,
      interval,
      verification_uri: `${process.env.APP_URL}/oauth/device?user_code=${user_code}`,
    },
    {
      headers: {
        "content-type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Authorization, content-type",
      },
      status: 200,
    }
  );
};

export const loader: LoaderFunction = async ({ request }) => {
  return new Response("", {
    headers: {
      "content-type": "text/plain",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Authorization, content-type",
    },
    status: 200,
  });
};
