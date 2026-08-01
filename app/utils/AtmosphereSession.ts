import type { FetchHandler } from "@atproto/xrpc";
import { SignJWT, importJWK, type JWK } from "jose";
import type { AtmosphereOAuthTokens } from "remix/auth";
import { createHash } from "node:crypto";

function ath(accessToken: string): string {
  return createHash("sha256").update(accessToken).digest("base64url");
}

export class AtmosphereSession {
  constructor(
    public did: `did:${string}:${string}`,
    private tokens: AtmosphereOAuthTokens, // from result.tokens / storage
    private pdsUrl: string,
    private onTokensUpdated: (tokens: AtmosphereOAuthTokens) => Promise<void>,
  ) {}

  private async dpopProof(method: string, url: string, nonce?: string) {
    let alg = algFromJwk(this.tokens.dpop.privateJwk);

    let privateKey = await importJWK(this.tokens.dpop.privateJwk as JWK, alg);
    return new SignJWT({
      htm: method,
      htu: url,
      ath: ath(this.tokens.accessToken),
      ...(nonce ? { nonce } : {}),
    })
      .setProtectedHeader({
        alg: alg,
        typ: "dpop+jwt",
        jwk: { ...this.tokens.dpop.publicJwk, alg } as JWK,
      })
      .setIssuedAt()
      .setJti(crypto.randomUUID())
      .sign(privateKey);
  }

  fetchHandler: FetchHandler = async (path, init) => {
    let url = new URL(path, this.pdsUrl).toString();
    let method = init?.method ?? "GET";

    let send = async (nonce?: string) =>
      fetch(url, {
        ...init,
        headers: {
          ...init?.headers,
          Authorization: `DPoP ${this.tokens.accessToken}`,
          DPoP: await this.dpopProof(method, url, nonce),
        },
      });

    let response = await send(this.tokens.dpop.nonce);

    if (response.status === 401 && response.headers.has("DPoP-Nonce")) {
      this.tokens.dpop.nonce = response.headers.get("DPoP-Nonce")!;
      await this.onTokensUpdated(this.tokens);
      response = await send(this.tokens.dpop.nonce);
    }

    return response;
  };
}

function algFromJwk(jwk: JsonWebKey): string {
  if (jwk.alg) return jwk.alg;
  if (jwk.kty === "EC") {
    switch (jwk.crv) {
      case "P-256":
        return "ES256";
      case "P-384":
        return "ES384";
      case "P-521":
        return "ES512";
    }
  }
  if (jwk.kty === "OKP" && jwk.crv === "Ed25519") return "EdDSA";
  throw new Error(`Unsupported DPoP JWK: kty=${jwk.kty} crv=${jwk.crv}`);
}
