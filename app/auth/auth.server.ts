import {User} from "@prisma/client";

import {db} from "~/helpers/prisma.server";
import {Authenticator} from "./authenticator";
import {sessionStorage} from "./localSession.server";
import {LocalStrategy} from "./strategies/local";

// Create an instance of the authenticator, pass a generic with what your
// strategies will return and will be stored in the session
export let authenticator = new Authenticator<User>(sessionStorage);

// Add the local strategy
authenticator.use(
  new LocalStrategy(
    // The strategy will use this URL to redirect the user in case it's logged-in
    // And to know if it should grab the username and password from the request
    // body in case of a POST request
    {loginURL: "/login", usernameField: "email"},
    async (username, password) => {
      // Find your user data in your database or external service
      let user = await db.user.findUnique({
        where: {email: username},
        include: {UserRole: {include: {Role: true}}},
      });
      if (!user) throw new Error("User not found");

      const {default: bcrypt} = await import("bcryptjs");
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) throw new Error("Invalid password");
      const {UserRole, ...userData} = user;
      const roles = UserRole?.map(r => r.Role?.name) || [];
      return {...userData, roles};
    }
  ),
  // The name of the strategy, every strategy has a default name, only add one
  // if you want to override it (e.g. setup more than one strategy)
  "local"
);
