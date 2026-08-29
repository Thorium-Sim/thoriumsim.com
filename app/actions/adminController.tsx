import { createController } from "remix/router";
import { routes } from "../routes.ts";
import { ensureAdmin } from "../utils/ensureAdmin.ts";
import { AdminIndexPage } from "../ui/pages/admin-index-page.tsx";
import { db } from "../db.ts";
import { subscriber, user } from "../db/tables.ts";
import { AdminSubscribersPage } from "../ui/pages/admin-subscribers-page.tsx";
import { sql } from "remix/data-table";
import { AdminNewslettersPage } from "../ui/pages/admin-newsletters-page.tsx";

export let adminController = createController(routes.admin, {
  middleware: [ensureAdmin()],
  actions: {
    async index(context) {
      const [users, pending, active, unsubscribed] = await Promise.all([
        db.count(user),
        db.count(subscriber, { where: { status: "pending" } }),
        db.count(subscriber, { where: { status: "active" } }),
        db.count(subscriber, { where: { status: "unsubscribed" } }),
      ]);
      return context.render(
        <AdminIndexPage
          users={users}
          pending={pending}
          active={active}
          unsubscribed={unsubscribed}
        />,
      );
    },
    async newsletters(context) {
      const data = await db.exec(sql`SELECT 
    p.post_id, 
    p.publishDate, 
    p.title,
    COALESCE(s.sendCount, 0) AS sendCount,
    COALESCE(o.openCount, 0) AS openCount
FROM Post p
LEFT JOIN (
    SELECT post_id, COUNT(*) AS sendCount
    FROM NewsletterSubscriberSends
    GROUP BY post_id
) s ON s.post_id = p.post_id
LEFT JOIN (
    SELECT broadcast_id, COUNT(*) AS openCount
    FROM SubscriberEmailOpen
    GROUP BY broadcast_id
) o ON o.broadcast_id = p.post_id
ORDER BY publishDate DESC;`);

      const results = data.rows as {
        post_id: number;
        publishDate: number;
        title: string;
        sendCount: number;
        openCount: number;
      }[];

      return context.render(<AdminNewslettersPage newsletters={results} />);
    },
    async users() {
      return new Response();
    },
    async subscribers(context) {
      const subscribers = await db.findMany(subscriber, { orderBy: ["created_at", "desc"] });
      return context.render(<AdminSubscribersPage subscribers={subscribers} />);
    },
  },
});
