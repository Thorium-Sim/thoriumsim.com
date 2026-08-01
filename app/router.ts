import { createRouter, type MiddlewareContext } from "remix/router";
import { staticFiles } from "remix/middleware/static";

import controller from "./actions/controller.tsx";
import { render } from "./middleware/render.tsx";
import { routes } from "./routes.ts";
import { compression } from "remix/middleware/compression";
import { createCookie } from "remix/cookie";
import { getEnv } from "./utils/env.ts";
import { createCookieSessionStorage } from "remix/session-storage/cookie";
import { session } from "remix/middleware/session";
import { db } from "./db.ts";
import { user } from "./db/tables.ts";
import { atmosphereController, authController } from "./actions/authController.tsx";
import { adminController } from "./actions/adminController.tsx";
import { auth, createSessionAuthScheme } from "remix/middleware/auth";

type AppContext = MiddlewareContext<[ReturnType<typeof render>]>;

declare module "remix/router" {
  interface RouterTypes {
    context: AppContext;
  }
}

let sessionCookie = createCookie("__session", {
  secrets: [getEnv().SESSION_SECRET],
  httpOnly: true,
  secure: true,
  sameSite: "Lax",
  path: "/",
});

let sessionStorage = createCookieSessionStorage();

export const router = createRouter<AppContext>({
  middleware: [
    session(sessionCookie, sessionStorage),
    auth({
      schemes: [
        createSessionAuthScheme({
          read(session) {
            return session.get("auth") as { userId: string } | null;
          },
          verify(value) {
            return db.findOne(user, { where: { user_id: value.userId } });
          },
          invalidate(session) {
            session.unset("auth");
          },
        }),
      ],
    }),
    compression({ threshold: 2048 }),
    staticFiles("./public", { index: false, cacheControl: `public, max-age=31536000, immutable` }),
    render(),
  ],
});

router.map(routes, controller);
router.map(routes.auth, authController);
router.map(routes.auth.atmosphere, atmosphereController);
router.map(routes.admin, adminController);
