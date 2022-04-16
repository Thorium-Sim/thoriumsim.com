import { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { getUploadUrl } from "~/helpers/b2";
import { validateToken } from "~/validateToken";

export const action: ActionFunction = async ({ request }) => {
  return new Response(JSON.stringify({}), {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "content-type": "text/plain",
    },
  });
};
export const loader: LoaderFunction = async ({ request }) => {
  if (request.method === "GET") {
    const user = await validateToken(request, ["github:issues"]);
    const result = await getUploadUrl();
    return new Response(JSON.stringify(result), {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Authorization, content-type",
        "content-type": "application/json",
      },
    });
  }
  return new Response(JSON.stringify({}), {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Authorization, content-type",
      "content-type": "application/json",
    },
  });
};
