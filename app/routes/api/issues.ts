import {
  ActionFunction,
  HeadersFunction,
  json,
  LoaderFunction,
} from "@remix-run/server-runtime";
import { validateToken } from "~/validateToken";

export const action: ActionFunction = async ({ request }) => {
  if (request.method === "POST") {
    const user = await validateToken(request, ["github:issues"]);
    const { repo, title, body, labels } = (await request.json()) as {
      repo: string;
      title: string;
      body: string;
      labels: string[];
    };
    const githubAccount = user.ConnectedAccount.find(
      (a) => a.type === "github"
    );

    if (!githubAccount)
      throw json(
        { error: "Account must be connected to Github to submit issues." },
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Authorization, content-type",
          },
          status: 400,
        }
      );
    const response = await fetch(
      `https://api.github.com/repos/thorium-sim/${repo}/issues`,
      {
        method: "POST",
        headers: {
          Authorization: `token ${githubAccount.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          body,
          labels,
        }),
      }
    );
    if (!response.ok)
      throw json(
        { error: response.statusText },
        {
          status: response.status,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Authorization, content-type",
          },
        }
      );
  }
  return json(
    { success: true },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Authorization, content-type",
      },
    }
  );
};
export let loader: LoaderFunction = async () => {
  return json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Authorization, content-type",
      },
    }
  );
};
export let headers: HeadersFunction = ({ loaderHeaders, actionHeaders }) => {
  return {
    "content-type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Authorization",
  };
};
