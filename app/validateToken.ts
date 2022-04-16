import { json } from "@remix-run/server-runtime";
import { db } from "~/helpers/prisma.server";

export async function validateToken(request: Request, scopes: string[]) {
  const token = request.headers
    .get("authorization")
    ?.replace("Bearer ", "")
    .replace("bearer ", "");
  if (!token) throw json({ error: "Authorization header is required" }, 400);

  const accessToken = await db.oAuthAccessToken.findFirst({
    where: {
      access_token: token,
    },
    include: {
      OAuthAccessTokenScope: true,
      User: {
        include: {
          ConnectedAccount: true,
        },
      },
    },
  });

  if (!accessToken) throw json({ error: "Invalid token" }, 401);

  const tokenScopes = accessToken.OAuthAccessTokenScope.map(
    (s) => s.scope || ""
  ).filter(Boolean);
  if (!scopes.every((s) => tokenScopes.includes(s)))
    throw json({ error: "Insufficient permissions" }, 401);
  const user = accessToken.User;
  if (!user) throw json({ error: "Invalid token" }, 401);

  return user;
}
