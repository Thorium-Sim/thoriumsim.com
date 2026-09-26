import { createController } from "remix/router";
import { routes } from "../routes.ts";
import { LoginPage } from "../ui/pages/login-page.tsx";
import { getEnv } from "../utils/env.ts";
import { redirect } from "remix/response/redirect";
import { formData } from "remix/middleware/form-data";
import { db } from "../db.ts";
import { user, userRoles } from "../db/tables.ts";
import { query } from "remix/data-table";
import { Session } from "remix/session";
import { UserPopover } from "../assets/user-popover.tsx";
import { ProfilePage } from "../ui/pages/profile-page.tsx";
import { createCookie } from "remix/cookie";
import { atmosphereOauthClient } from "../utils/AtmosphereAuth.ts";
import { Client } from "@atcute/client";
import {
  CompositeDidDocumentResolver,
  CompositeHandleResolver,
  DohJsonHandleResolver,
  LocalActorResolver,
  PlcDidDocumentResolver,
  WebDidDocumentResolver,
  WellKnownHandleResolver,
} from "@atcute/identity-resolver";
import type { Did } from "@atcute/lexicons";
import { isHandle } from "@atcute/lexicons/syntax";
import { isDid } from "@atcute/lexicons/syntax";

export interface AuthRecord {
  userId: string;
  handle: string;
  displayName: string;
  avatar?: string;
  roles: string[];
}

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

const handleResolver = new CompositeHandleResolver({
  methods: {
    dns: new DohJsonHandleResolver({ dohUrl: "https://mozilla.cloudflare-dns.com/dns-query" }),
    http: new WellKnownHandleResolver(),
  },
});
const didResolver = new CompositeDidDocumentResolver({
  methods: {
    plc: new PlcDidDocumentResolver(),
    web: new WebDidDocumentResolver(),
  },
});
const actorResolver = new LocalActorResolver({
  handleResolver,
  didDocumentResolver: didResolver,
});

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

function isPlcDid(input: unknown): input is Did<"plc"> {
  return isDid(input) && input.startsWith("did:plc");
}
function isWebDid(input: unknown): input is Did<"web"> {
  return isDid(input) && input.startsWith("did:web");
}

async function getHandle(userId: string) {
  if (!isPlcDid(userId) && !isWebDid(userId)) throw new Error("Invalid User ID");
  const doc = await actorResolver.resolve(userId);

  return doc.handle;
}

async function generateUserSession(session: Session, userId: string) {
  const [userRecord, handle] = await Promise.all([
    db.findOne(user, {
      where: { id: userId },
      with: {
        roles: userRoles,
      },
    }),
    getHandle(userId),
  ]);

  if (!userRecord) throw new Error("User not found");
  session.set("auth", {
    userId,
    handle,
    displayName: userRecord.displayName,
    avatar: userRecord.avatar,
    roles: userRecord.roles.flatMap((r) => r.role || []),
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
      // TODO August 7 2026 — fix this type
      const user = context.auth.ok ? context.auth.identity : null;

      return context.render(<UserPopover user={user} />);
    },
    async refresh(context) {
      if (!context.auth.ok) throw new Error("Session not found");

      await generateUserSession(context.session, context.auth.identity.id);
      return redirect("/");
    },
    oauthClientMetadata() {
      return Response.json(atmosphereOauthClient.metadata);
    },
    async jwks() {
      return Response.json(atmosphereOauthClient.jwks);
    },
  },
});
export let atmosphereController = createController(routes.auth.atmosphere, {
  middleware: [formData()],
  actions: {
    async login(context) {
      const handle = context.formData.get("handle") ?? context.formData.get("handle-input");
      if (!handle || typeof handle !== "string" || !isHandle(handle)) {
        return redirect(routes.home.href());
      }

      const { url } = await atmosphereOauthClient.authorize({
        target: { type: "account", identifier: handle },
        prompt: "login",
        state: { returnTo: context.url.searchParams.get("returnTo") },
      });

      return redirect(url);
    },
    async createAccount(context) {
      const { url } = await atmosphereOauthClient.authorize({
        target: { type: "pds", serviceUrl: "https://selfhosted.social" },
        prompt: "create",
        state: { returnTo: context.url.searchParams.get("returnTo") },
      });
      return redirect(url);
    },
    async callback(context) {
      const { session, state } = await atmosphereOauthClient.callback(context.url.searchParams);
      const did = session.did;
      const { returnTo } = state as { returnTo?: string };

      const client = new Client({ handler: session });

      const [profileResult, existingUser, handle] = await Promise.all([
        client.get("app.bsky.actor.getProfile", {
          params: { actor: session.did },
        }),
        db.findOne(user, { where: { id: did } }),
        getHandle(did),
      ]);

      let displayName: string = handle;
      let bio = "";
      let avatar = "";
      if (profileResult.ok) {
        displayName = profileResult.data.displayName || handle;
        bio = profileResult.data.description || "";
        avatar = profileResult.data.avatar || "";
      }

      let userId = existingUser?.id;
      if (!userId) {
        const savedUser = await db.exec(
          query(user).insert(
            {
              bio,
              displayName,
              avatar,
            },
            { returning: "*" },
          ),
        );
        userId = savedUser.insertId as string;
      }

      if (userId) {
        let session = context.get(Session)!;
        session?.regenerateId();
        await generateUserSession(session, userId);
      }

      let savedHandles = JSON.parse(
        (await savedHandlesCookie.parse(context.headers.get("Cookie"))) || "[]",
      );
      const storedAvatar = truncateAvatarForCookie(avatar || null);
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
