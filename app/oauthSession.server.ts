import { createCookieSessionStorage } from "@remix-run/node";

export let oauthStorage = createCookieSessionStorage({
  cookie: {
    name: "_oauth",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: [process.env.COOKIE_SECRET || "secret"],
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60, // 1 hour,
  },
});
