import { db } from "~/helpers/prisma.server";
import crypto from "crypto";
import { oauthStorage } from "~/oauthSession.server";
import { LoaderFunction, redirect } from "@remix-run/server-runtime";
import {
  commitSession,
  createUserSession,
  getSession,
  getUser,
} from "~/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const params = new URL(request.url).searchParams;
  const { error, error_description, error_uri, state, code, type, ...rest } =
    Object.fromEntries(params.entries());
  const signedInUser = await getUser(request);
  const session = await getSession(request);
  try {
    if (error) {
      throw new Error(error_description);
    }
    if (!code) {
      throw new Error("No code provided.");
    }
    const expectedState = crypto
      .createHmac("sha256", process.env.COOKIE_SECRET || "")
      .update(`oauth-token`)
      .digest("hex");

    if (state !== expectedState) {
      throw new Error("Invalid state");
    }
    switch (type) {
      case "github": {
        const accessRequest = await fetch(
          "https://github.com/login/oauth/access_token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              client_id: process.env.GH_CLIENT_ID,
              client_secret: process.env.GH_CLIENT_SECRET,
              code,
              redirect_uri: `${process.env.APP_URL}/webhooks/oauth`,
            }),
          }
        ).then((res) => res.json());

        // Let's do some stuff with the token
        const githubUser = await fetch(`https://api.github.com/user`, {
          headers: {
            Authorization: `token ${accessRequest.access_token}`,
          },
        }).then((res) => res.json());

        let connectedAccount = await db.connectedAccount.findFirst({
          where: {
            type: "github",
            account_id: githubUser.id.toString(),
          },
          include: {
            User: true,
          },
        });
        let user = connectedAccount?.User;

        if (!user && !signedInUser) {
          const githubUserEmails = await fetch(
            `https://api.github.com/user/emails`,
            {
              headers: {
                Authorization: `token ${accessRequest.access_token}`,
              },
            }
          ).then((res) => res.json());
          const primaryEmail = githubUserEmails.find(
            (email: { primary: boolean; email: string }) => email.primary
          )?.email;
          user = await db.user.upsert({
            create: {
              password: "",
              email: primaryEmail,
              displayName: githubUser.name,
              profilePictureUrl: githubUser.avatar_url,
              bio: githubUser.bio,
              ConnectedAccount: {
                create: {
                  type: "github",
                  access_token: accessRequest.access_token,
                  createdAt: new Date(),
                  account_id: githubUser.id.toString(),
                },
              },
            },
            update: {
              ConnectedAccount: {
                create: {
                  type: "github",
                  access_token: accessRequest.access_token,
                  createdAt: new Date(),
                  account_id: githubUser.id.toString(),
                },
              },
            },
            where: {
              email: primaryEmail,
            },
          });
        } else {
          if (!user && signedInUser) {
            user = signedInUser as any;
          }
          if (!user) throw "Error connecting account";
          await db.connectedAccount.upsert({
            create: {
              user_id: user.user_id,
              type: "github",
              access_token: accessRequest.access_token,
              createdAt: new Date(),
              account_id: githubUser.id.toString(),
            },
            update: {
              access_token: accessRequest.access_token,
              createdAt: new Date(),
            },
            where: {
              connectedAccount_id: connectedAccount?.connectedAccount_id || -1,
            },
          });
        }
        const { password, ...splitUser } = user;

        // Invite the user to the Github org
        await fetch(
          `https://api.github.com/orgs/thorium-sim/memberships/${githubUser.login}`,
          {
            method: "PUT",
            headers: {
              Authorization: `token ${process.env.GITHUB_TOKEN}`,
            },
          }
        ).then((res) => res.json());

        // Star the Thorium Nova repo
        await fetch(
          `https://api.github.com/user/starred/thorium-sim/thorium-nova`,
          {
            method: "PUT",
            headers: {
              Authorization: `token ${accessRequest.access_token}`,
            },
          }
        );
        session.flash("toast", "Github Connected");
        let oauthSession = await oauthStorage.getSession(
          request.headers.get("Cookie")
        );
        const user_code = oauthSession.get("user_code");
        return createUserSession({
          request,
          userId: user.user_id,
          remember: true,
          redirectTo: user_code
            ? `/oauth/device?user_code=${user_code}`
            : "/profile",
        });

        break;
      }
      case "discord": {
        const { access_token, expires_in, refresh_token } = await fetch(
          "https://discord.com/api/oauth2/token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `grant_type=authorization_code&code=${code}&redirect_uri=${process.env.APP_URL}/webhooks/oauth%3Ftype%3Ddiscord&client_id=${process.env.DISCORD_CLIENT_ID}&client_secret=${process.env.DISCORD_CLIENT_SECRET}`,
          }
        ).then((res) => res.json());

        // Do some extra stuff
        const { Routes } = await import("discord-api-types/v9");

        const discordUser = await fetch(
          `https://discord.com/api/v9${Routes.oauth2CurrentAuthorization()}`,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        ).then((res) => res.json());

        const moreDiscordUser = await fetch(
          `https://discord.com/api/v9${Routes.user()}`,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        ).then((res) => res.json());

        let connectedAccount = await db.connectedAccount.findFirst({
          where: {
            type: "discord",
            account_id: moreDiscordUser.id.toString(),
          },
          include: {
            User: true,
          },
        });

        let user = connectedAccount?.User;

        if (!user && !signedInUser) {
          user = await db.user.upsert({
            create: {
              password: "",
              email: moreDiscordUser.email,
              displayName: discordUser.user.username,
              profilePictureUrl: "",
              bio: "",
              ConnectedAccount: {
                create: {
                  type: "discord",
                  access_token: access_token,
                  refresh_token: refresh_token,
                  createdAt: new Date(),
                  expiresAt: new Date(Date.now() + expires_in * 1000),
                  account_id: moreDiscordUser.id.toString(),
                },
              },
            },
            update: {
              ConnectedAccount: {
                create: {
                  type: "discord",
                  access_token: access_token,
                  refresh_token: refresh_token,
                  createdAt: new Date(),
                  expiresAt: new Date(Date.now() + expires_in * 1000),
                  account_id: moreDiscordUser.id.toString(),
                },
              },
            },
            where: {
              email: moreDiscordUser.email,
            },
          });
        } else {
          if (!user && signedInUser) {
            user = signedInUser as any;
          }
          if (!user) throw "Error connecting account";
          await db.connectedAccount.upsert({
            create: {
              user_id: user.user_id,
              type: "discord",
              access_token,
              refresh_token,
              expiresAt: new Date(Date.now() + expires_in * 1000),
              createdAt: new Date(),
              account_id: moreDiscordUser.id.toString(),
            },
            update: {
              access_token,
              refresh_token,
              expiresAt: new Date(Date.now() + expires_in * 1000),
              createdAt: new Date(),
            },
            where: {
              connectedAccount_id: connectedAccount?.connectedAccount_id || -1,
            },
          });
        }
        const { password, ...splitUser } = user;

        // Add the user to the guild

        await fetch(
          `https://discord.com/api/v9${Routes.guildMember(
            process.env.GUILD_ID || "",
            discordUser.user.id
          )}`,
          {
            body: JSON.stringify({ access_token: access_token }),
            method: "PUT",
            headers: {
              Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
            },
          }
        );
        // Give the user the 'Thorium Account' role
        fetch(
          `https://discord.com/api/v9${Routes.guildMemberRole(
            process.env.GUILD_ID || "",
            discordUser.user.id,
            process.env.DISCORD_ROLE_ID || ""
          )}`,
          {
            body: JSON.stringify({ access_token }),
            method: "PUT",
            headers: {
              Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
            },
          }
        );

        session.flash("toast", "Discord Connected");
        let oauthSession = await oauthStorage.getSession(
          request.headers.get("Cookie")
        );
        const user_code = oauthSession.get("user_code");
        return createUserSession({
          request,
          userId: user.user_id,
          remember: true,
          redirectTo: user_code
            ? `/oauth/device?user_code=${user_code}`
            : "/profile",
        });
        break;
      }
    }
  } catch (err) {
    console.error(err);
    if (err instanceof Error) {
      session.flash("error", err.message);
    }
  }
};

export default function OAuth(props: any) {
  return null;
}
