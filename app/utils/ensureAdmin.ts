import { Session } from "@remix-run/session";
import type { Middleware } from "remix/router";
import { redirect } from "remix/response/redirect";

export function ensureAdmin(): Middleware {
  return (context, next) => {
    const session = context.get(Session);
    // TODO August 7 2026 — fix this type
    const user = session?.get("auth") as unknown as {
      userId: number;
      handle: string;
      displayName: string;
      avatar?: string;
      roles: string[];
    } | null;

    if (!user?.roles.includes("admin")) {
      return redirect("/");
    }

    return next();
  };
}
