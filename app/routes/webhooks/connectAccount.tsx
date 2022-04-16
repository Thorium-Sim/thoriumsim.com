import { ActionFunction, redirect } from "@remix-run/server-runtime";
import crypto from "crypto";

export const action: ActionFunction = async ({ request }) => {
  const type = new URL(request.url).searchParams.get("type");
  const state = crypto
    .createHmac("sha256", process.env.COOKIE_SECRET || "")
    .update(`oauth-token`)
    .digest("hex");

  switch (type) {
    case "github": {
      const params = new URLSearchParams({
        client_id: process.env.GH_CLIENT_ID || "",
        redirect_uri: `${process.env.APP_URL}/webhooks/oauth?type=github`,
        scope: "user:email public_repo",
        state,
      });
      const url = `https://github.com/login/oauth/authorize?${params.toString()}`;
      return redirect(url);
    }
    case "discord": {
      const params = new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID || "",
        redirect_uri: `${process.env.APP_URL}/webhooks/oauth?type=discord`,
        scope: "identify email messages.read guilds guilds.join",
        state,
        response_type: "code",
      });
      const url = `https://discord.com/api/oauth2/authorize?${params.toString()}`;
      return redirect(url);
    }
    default:
      return redirect("/profile");
  }
  return {};
};

export default function ConnectAccount(props: any) {
  return null;
}
