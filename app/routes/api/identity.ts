import { json, LoaderFunction } from "@remix-run/server-runtime";
import { validateToken } from "~/validateToken";

export const loader: LoaderFunction = async ({ request }) => {
  if (request.method === "GET") {
    const {
      password,
      passwordResetExpire,
      passwordResetToken,
      email,
      ...user
    } = await validateToken(request, ["identity"]);

    return json(
      {
        ...user,
        accounts: user.ConnectedAccount.map((a) => a.type),

        ConnectedAccount: undefined,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Content-Type": "application/json",
        },
      }
    );
  }
  return json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Content-Type": "application/json",
      },
    }
  );
};
