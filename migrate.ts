import { PrismaClient as oldClient } from "@prisma/client";
import { PrismaClient } from "./prisma/new-client";

(async () => {
  const db = new oldClient();
  db.$connect();
  const newDb = new PrismaClient();
  newDb.$connect();

  const actions: any[] = [];

  const tables = [
    "user",
    "connectedAccount",
    "post",
    "subscriber",
    "newsletterSubscriberSends",
    "oAuthApp",
    "oAuthScope",
    "oAuthAccessToken",
    "oAuthAccessTokenScope",
    "oAuthDeviceRequest",
    "oAuthDeviceRequestScope",
    "oAuthAuthorizationCode",
    "oAuthAuthorizationScope",
    "oAuthCallbackURL",
    "tag",
    "subscriberTag",
    "postSubscriberTag",
    "subscriberTagLookup",
    "postTag",
    "subscriberEmailOpen",
    "role",
    "userRole",
    "coreLayout",
  ];

  const firstUser = await newDb.user.findFirst();
  if (!firstUser) {
    for (const table of tables) {
      console.log("Fetching", table);
      await db[table].findMany().then((rows) => {
        for (const row of rows) {
          actions.push(newDb[table].create({ data: row }));
        }
      });
    }

    await newDb.$transaction(actions);
  }
  await db.$disconnect();
  await newDb.$disconnect();
})();
