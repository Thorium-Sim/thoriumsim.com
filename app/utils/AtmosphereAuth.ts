import {
  CompositeDidDocumentResolver,
  CompositeHandleResolver,
  LocalActorResolver,
  PlcDidDocumentResolver,
  WebDidDocumentResolver,
  WellKnownHandleResolver,
} from "@atcute/identity-resolver";
import { NodeDnsHandleResolver } from "@atcute/identity-resolver-node";

import { OAuthClient, type Store, type ClientAssertionPrivateJwk } from "@atcute/oauth-node-client";
import { db } from "../db.ts";
import { kv } from "../db/tables.ts";
import { getEnv } from "./env.ts";

interface AtmosphereOauthClientOptions {
  clientId: URL;
  redirectUri: URL;
  jwksUri: URL;
  scope: string[];
}

class SQLiteStore<K extends string, V> implements Store<K, V> {
  constructor(private scope: string) {}
  async clear() {
    await db.deleteMany(kv, { where: { scope: this.scope } });
  }
  async delete(key: K) {
    await db.delete(kv, { scope: this.scope, key });
  }
  async get(key: K) {
    const record = await db.findOne(kv, { where: { scope: this.scope, key } });
    return record ? JSON.parse(record.value) : undefined;
  }
  async set(key: K, value: V) {
    const record = await this.get(key);
    if (record) {
      await db.update(kv, { key, scope: this.scope }, { value: JSON.stringify(value) });
    } else {
      await db.create(kv, { scope: this.scope, key, value: JSON.stringify(value) });
    }
  }
}

function getPrivateKey(): ClientAssertionPrivateJwk {
  const keyJson = getEnv().ATPROTO_PRIVATE_KEY_JWK;
  if (!keyJson) {
    throw new Error("ATPROTO_PRIVATE_KEY_JWK is required for confidential OAuth client");
  }
  const jwk = JSON.parse(keyJson) as ClientAssertionPrivateJwk;

  if (!jwk.kid) {
    jwk.kid = "thoriumsim-oauth";
  }
  return jwk;
}

function createOAuthClient({
  clientId,
  redirectUri,
  scope,
  jwksUri,
}: AtmosphereOauthClientOptions): InstanceType<typeof OAuthClient> {
  const baseMetadata = {
    scope: scope.join(" "),
    application_type: "web",
    client_name: "Thorium",
    logo_uri: "https://thoriumsim.com/favicon.svg",
    redirect_uris: [redirectUri.toString()],
  };
  return new OAuthClient({
    ...(clientId.origin === "http://localhost"
      ? { metadata: baseMetadata }
      : {
          metadata: { ...baseMetadata, client_id: clientId.toString(), jwksUri },
          keyset: [getPrivateKey()],
        }),
    stores: { sessions: new SQLiteStore("sessions"), states: new SQLiteStore("states") },
    actorResolver: new LocalActorResolver({
      handleResolver: new CompositeHandleResolver({
        methods: {
          dns: new NodeDnsHandleResolver(),
          http: new WellKnownHandleResolver(),
        },
      }),
      didDocumentResolver: new CompositeDidDocumentResolver({
        methods: {
          plc: new PlcDidDocumentResolver(),
          web: new WebDidDocumentResolver(),
        },
      }),
    }),
  });
}

const SCOPES = [
  "atproto",
  "blob:*/*",
  "rpc:app.bsky.actor.getProfile?aud=did:web:api.bsky.app%23bsky_appview",
];

const env = getEnv();
export const atmosphereOauthClient = createOAuthClient({
  clientId:
    env.APP_ORIGIN === "http://localhost"
      ? new URL(env.APP_ORIGIN)
      : new URL("/oauth/client-metadata.json", env.APP_ORIGIN),
  redirectUri:
    env.APP_ORIGIN === "http://localhost"
      ? new URL("http://127.0.0.1:5173/oauth/callback")
      : new URL("/oauth/callback", env.APP_ORIGIN),
  jwksUri:
    env.APP_ORIGIN === "http://localhost"
      ? new URL(env.APP_ORIGIN)
      : new URL("/oauth/jwks.json", env.APP_ORIGIN),
  scope: SCOPES,
});
