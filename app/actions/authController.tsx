import { createController } from "remix/router";
import { routes } from "../routes.ts";
import { LoginPage } from "../ui/pages/login-page.tsx";
import {
  completeAuth,
  createAtmosphereAuthProvider,
  finishExternalAuth,
  startExternalAuth,
  type AtmosphereAuthProfile,
  type AtmosphereOAuthTokens,
} from "remix/auth";
import { getEnv } from "../utils/env.ts";
import { redirect } from "remix/response/redirect";
import { formData } from "remix/middleware/form-data";
import { Client, l } from "@atproto/lex";
import * as app from "../atproto/app.ts";
import * as com from "../atproto/com.ts";
import { db } from "../db.ts";
import { connectedAccount, user, userConnectedAccounts, userRoles } from "../db/tables.ts";
import { query } from "remix/data-table";
import { Session } from "@remix-run/session";
import { UserPopover } from "../assets/user-popover.tsx";
import { ProfilePage } from "../ui/pages/profile-page.tsx";
import { createCookie } from "remix/cookie";
import { AtmosphereSession } from "../utils/AtmosphereSession.ts";

const env = getEnv();

const SCOPES = [
  "atproto",
  "account:email",
  "blob:*/*",
  "rpc:app.bsky.actor.getProfile?aud=did:web:api.bsky.app%23bsky_appview",
];
let keyPair = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, [
  "sign",
  "verify",
]);

let atmosphereProvider = createAtmosphereAuthProvider({
  clientId:
    env.APP_ORIGIN === "http://localhost"
      ? new URL(env.APP_ORIGIN)
      : new URL("/oauth/client-metadata.json", env.APP_ORIGIN),
  redirectUri:
    env.APP_ORIGIN === "http://localhost"
      ? new URL("http://127.0.0.1:44100/oauth/callback")
      : new URL("/oauth/callback", env.APP_ORIGIN),
  sessionSecret: env.SESSION_SECRET,
  scopes: SCOPES,
  clientAuthentication: { key: keyPair.privateKey, keyId: "thoriumsim-oauth" },
});

let savedHandlesCookie = createCookie("saved-handles", {
  secrets: [getEnv().SESSION_SECRET],
  httpOnly: true,
  secure: true,
  sameSite: "Lax",
  path: "/",
});

export interface SavedHandle {
  handle: string;
  avatar: string | undefined;
  lastUsed: number;
}

/** Keep cookie under ~4KB browser limits when many avatars are CDN URLs */
const SAVED_HANDLE_AVATAR_MAX_CHARS = 900;

function truncateAvatarForCookie(avatar: string | null): string | null {
  if (avatar === null) {
    return null;
  }
  if (avatar.length <= SAVED_HANDLE_AVATAR_MAX_CHARS) {
    return avatar;
  }
  return avatar.slice(0, SAVED_HANDLE_AVATAR_MAX_CHARS);
}

async function generateUserSession(session: Session, userId: number) {
  const userRecord = await db.findOne(user, {
    where: { user_id: userId },
    with: {
      roles: userRoles,
      connectedAccount: userConnectedAccounts.where({ type: "atmosphere" }),
    },
  });

  if (!userRecord) throw new Error("User not found");
  const account = userRecord.connectedAccount[0];
  if (!account || !account.access_token || !account.issuer)
    throw new Error("User is not connected to Atmosphere account");
  const client = new Client(
    new AtmosphereSession(
      account.account_id as `did:${string}:${string}`,
      JSON.parse(account.access_token),
      account.issuer,
      async () => {},
    ),
  );

  const profile = await client.call(app.bsky.actor.getProfile, {
    actor: l.asAtIdentifierString(account.account_id),
  });

  session.set("auth", {
    userId,
    handle: profile.handle,
    displayName: userRecord.displayName,
    avatar: userRecord.profilePictureUrl,
    roles: userRecord.roles.flatMap((r) => r.name || []),
  });
}

export let authController = createController(routes.auth, {
  actions: {
    async login(context) {
      const savedHandles = await savedHandlesCookie.parse(context.headers.get("Cookie"));

      return context.render(<LoginPage savedHandles={JSON.parse(savedHandles || "[]")} />);
    },
    logout(context) {
      const session = context.get(Session);
      session?.unset("auth");
      return redirect(routes.home.href());
    },
    profile(context) {
      return context.render(<ProfilePage />);
    },
    userPopover(context) {
      const session = context.get(Session);
      // TODO August 7 2026 — fix this type
      const user = session?.get("auth") as unknown as {
        userId: number;
        handle: string;
        displayName: string;
        avatar?: string;
        roles: string[];
      } | null;

      return context.render(<UserPopover user={user} />);
    },
    async refresh(context) {
      const session = context.get(Session);
      const user = session?.get("auth");
      if (!user || !session) throw new Error("Session not found");
      await generateUserSession(session, user.userId);
      return redirect("/");
    },
    oauthClientMetadata() {
      return Response.json({
        client_id: "https://thoriumsim.com/oauth/client-metadata.json",
        client_name: "Thorium",
        logo_uri: "https://thoriumsim.com/favicon.svg",
        client_uri: "https://thoriumsim.com",
        redirect_uris: ["https://thoriumsim.com/oauth/callback"],
        scope: SCOPES.join(" "),
        application_type: "web",
        subject_type: "public",
        response_types: ["code"],
        grant_types: ["authorization_code", "refresh_token"],
        token_endpoint_auth_method: "private_key_jwt",
        token_endpoint_auth_signing_alg: "ES256",
        dpop_bound_access_tokens: true,
        jwks_uri: "https://thoriumsim.com/oauth/jwks.json",
      });
    },
    async jwks() {
      return Response.json({
        keys: [
          {
            ...(await crypto.subtle.exportKey("jwk", keyPair.publicKey)),
            kid: "thoriumsim-oauth",
            alg: "ES256",
            use: "sig",
          },
        ],
      });
    },
  },
});
export let atmosphereController = createController(routes.auth.atmosphere, {
  middleware: [formData()],
  actions: {
    async login(context) {
      const handle = context.formData.get("handle") ?? context.formData.get("handle-input");
      if (!handle || typeof handle !== "string") return redirect(routes.auth.login.href());
      const provider = await atmosphereProvider.prepare(handle);
      return startExternalAuth(provider, context, {
        returnTo: context.url.searchParams.get("returnTo"),
      });
    },
    async createAccount(context) {
      const provider = await atmosphereProvider.prepareCreateAccount("https://selfhosted.social");
      return startExternalAuth(provider, context, {
        returnTo: context.url.searchParams.get("returnTo"),
      });
    },
    async callback(context) {
      if (context.url.hostname === "127.0.0.1") {
        const url = new URL(context.url);
        url.hostname = "localhost";
        return redirect(url);
      }

      let { result, returnTo } = await finishExternalAuth<
        typeof context,
        AtmosphereAuthProfile,
        "atmosphere",
        AtmosphereOAuthTokens
      >(atmosphereProvider, context);

      const client = new Client(
        new AtmosphereSession(
          result.profile.did as `did:${string}:${string}`,
          result.tokens,
          result.profile.pdsUrl,
          async () => {},
        ),
      );

      const [profileResult, serverSession] = await Promise.all([
        client.call(app.bsky.actor.getProfile, {
          actor: l.asAtIdentifierString(result.profile.did),
        }),
        client.call(com.atproto.server.getSession),
      ]);

      const [existingConnectedAccount, existingUser] = await Promise.all([
        db.findOne(connectedAccount, {
          where: { account_id: serverSession.did },
        }),
        db.findOne(user, { where: { email: serverSession.email } }),
      ]);

      const displayName =
        profileResult.displayName || serverSession.handle || result.profile.handle;
      let userId = existingConnectedAccount?.user_id;

      if (existingConnectedAccount) {
        await db.exec(
          query(connectedAccount)
            .where({ connectedAccount_id: existingConnectedAccount.connectedAccount_id })
            .update({
              access_token: JSON.stringify(result.tokens),
              expiresAt: Number(result.tokens.expiresAt),
              issuer: result.profile.pdsUrl,
            }),
        );
      } else {
        let userId = existingUser?.user_id;
        if (!userId) {
          const savedUser = await db.exec(
            query(user).insert(
              {
                bio: profileResult.description,
                displayName,
                profilePictureUrl: profileResult.avatar,
                email: serverSession.email,
                password: "blank",
              },
              { returning: "*" },
            ),
          );
          userId = savedUser.insertId as number;
        }
        await db.exec(
          query(connectedAccount).insert({
            user_id: userId,
            account_id: serverSession.did,
            access_token: JSON.stringify(result.tokens),
            expiresAt: Number(result.tokens.expiresAt),
            issuer: result.profile.pdsUrl,
            refresh_token: null,
            type: "atmosphere",
          }),
        );
      }

      let handle = result.profile.handle || serverSession.handle;

      if (userId) {
        let session = completeAuth(context);
        await generateUserSession(session, userId);
      }

      let savedHandles = JSON.parse(
        (await savedHandlesCookie.parse(context.headers.get("Cookie"))) || "[]",
      );
      const storedAvatar = truncateAvatarForCookie(profileResult.avatar || null);
      const updated = [
        { handle, avatar: storedAvatar, lastUsed: Date.now() },
        ...savedHandles.filter((s: { handle: string }) => s.handle !== handle),
      ]
        .toSorted((a: SavedHandle, b: SavedHandle) => b.lastUsed - a.lastUsed)
        .slice(0, 5);

      return redirect(returnTo ?? routes.home.href(), {
        headers: { "Set-Cookie": await savedHandlesCookie.serialize(JSON.stringify(updated)) },
      });
    },
  },
});
