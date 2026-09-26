import { column as c, hasMany, table } from "remix/data-table";

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

let user = table({
  name: "User",
  primaryKey: "id",
  columns: {
    id: c.text().primaryKey(),
    handle: c.text(),
    avatar: c.text().nullable(),
    displayName: c.text().nullable(),
    bio: c.text().nullable(),
  },
});

let newsletterSubscriberSends = table({
  name: "NewsletterSubscriberSends",
  columns: {
    id: c.integer().primaryKey().autoIncrement(),
    subscriber_email: c.text().nullable(),
    post_id: c.integer().nullable(),
    createdAt: c.timestamp().defaultNow(),
  },
});

let post = table({
  name: "Post",
  primaryKey: "post_id",
  columns: {
    post_id: c.integer().primaryKey().autoIncrement(),
    publishDate: c.timestamp().nullable().defaultSql("CURRENT_DATE"),
    featuredImageUrl: c.text().nullable(),
    body: c.text().nullable(),
    title: c.text(),
    slug: c.text().unique(),
    published: c.boolean().nullable().default(false),
    excerpt: c.text().nullable(),
    newsletterDate: c.timestamp().nullable(),
    newsletterSent: c.boolean().default(false),
  },
});

let subscriber = table({
  name: "Subscriber",
  primaryKey: "subscriber_id",
  columns: {
    subscriber_id: c.integer().primaryKey().autoIncrement(),
    email: c.text().unique(),
    subscribeToken: c.text().nullable(),
    firstName: c.text().nullable(),
    status: c.text().default("pending"),
    created_at: c.timestamp().defaultNow(),
  },
});

let subscriberEmailOpen = table({
  name: "SubscriberEmailOpen",
  primaryKey: "subscriber_email_open_id",
  columns: {
    subscriber_email_open_id: c.integer().primaryKey().autoIncrement(),
    subscriber_id: c.integer().nullable(),
    opened_at: c.timestamp().defaultNow(),
    broadcast_id: c.integer().nullable(),
  },
});

let userRole = table({
  name: "UserRole",
  primaryKey: ["user", "role"],
  columns: {
    user: c.text(),
    role: c.text(),
  },
});

let kv = table({
  name: "KV",
  primaryKey: ["scope", "key"],
  columns: {
    scope: c.text().notNull(),
    key: c.text().notNull(),
    value: c.text(),
  },
});

// ---------------------------------------------------------------------------
// Relations
//
// NOTE: several FK columns in this schema don't follow a `<table>_id ->
// <table>.id` convention (e.g. ConnectedAccount.user_id -> User.user_id,
// OAuthAccessTokenScope.accessToken_ID -> OAuthAccessToken.id). I've passed
// explicit key options below, but I couldn't fully verify the exact option
// property names (foreignKey/references vs local/foreign, etc.) against
// HasManyOptions / HasOneOptions / BelongsToOptions / HasManyThroughOptions
// in the API reference -- double check those before relying on this section.
// ---------------------------------------------------------------------------

let postNewsletterSubscriberSends = hasMany(post, newsletterSubscriberSends, {
  foreignKey: "post_id",
  targetKey: "post_id",
});
let subscriberNewsletterSends = hasMany(subscriber, newsletterSubscriberSends, {
  foreignKey: "subscriber_email",
  targetKey: "email",
});

let userRoles = hasMany(user, userRole, { foreignKey: "user", targetKey: "id" });

let postSubscriberEmailOpens = hasMany(post, subscriberEmailOpen, {
  foreignKey: "broadcast_id",
  targetKey: "post_id",
});
let subscriberSubscriberEmailOpens = hasMany(subscriber, subscriberEmailOpen, {
  foreignKey: "subscriber_id",
  targetKey: "subscriber_id",
});

export {
  user,
  newsletterSubscriberSends,
  post,
  subscriber,
  subscriberEmailOpen,
  userRole,
  postNewsletterSubscriberSends,
  subscriberNewsletterSends,
  userRoles,
  postSubscriberEmailOpens,
  subscriberSubscriberEmailOpens,
  kv,
};
