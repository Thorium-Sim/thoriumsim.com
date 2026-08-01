import { belongsTo, column as c, hasMany, hasManyThrough, table } from "remix/data-table";

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

let user = table({
  name: "User",
  primaryKey: "user_id",
  columns: {
    user_id: c.integer().primaryKey().autoIncrement(),
    email: c.text().unique("users_email_key"),
    password: c.text(),
    profilePictureUrl: c.text().nullable(),
    displayName: c.text().nullable(),
    bio: c.text().nullable(),
    passwordResetToken: c.text().nullable(),
    passwordResetExpire: c.timestamp().nullable(),
  },
});

let connectedAccount = table({
  name: "ConnectedAccount",
  primaryKey: "connectedAccount_id",
  columns: {
    connectedAccount_id: c.integer().primaryKey().autoIncrement(),
    user_id: c.integer().nullable(),
    type: c.text(),
    access_token: c.text().nullable(),
    refresh_token: c.text().nullable(),
    createdAt: c.timestamp().nullable(),
    expiresAt: c.timestamp().nullable(),
    account_id: c.text().nullable(),
    issuer: c.text().nullable(),
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
    user_id: c.integer(),
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

let role = table({
  name: "Role",
  primaryKey: "role_id",
  columns: {
    role_id: c.integer().primaryKey().autoIncrement(),
    name: c.text().nullable(),
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
  primaryKey: "userRole_id",
  columns: {
    userRole_id: c.integer().primaryKey().autoIncrement(),
    user_id: c.integer().nullable(),
    role_id: c.integer().nullable(),
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

let userConnectedAccounts = hasMany(user, connectedAccount, {
  foreignKey: "user_id",
  targetKey: "user_id",
});
let connectedAccountUser = belongsTo(connectedAccount, user, {
  foreignKey: "user_id",
  targetKey: "user_id",
});

let userPosts = hasMany(user, post, { foreignKey: "user_id", targetKey: "user_id" });
let postUser = belongsTo(post, user, { foreignKey: "user_id", targetKey: "user_id" });

let postNewsletterSubscriberSends = hasMany(post, newsletterSubscriberSends, {
  foreignKey: "post_id",
  targetKey: "post_id",
});
let subscriberNewsletterSends = hasMany(subscriber, newsletterSubscriberSends, {
  foreignKey: "subscriber_email",
  targetKey: "email",
});

let userUserRoles = hasMany(user, userRole, { foreignKey: "user_id", targetKey: "user_id" });
let userRoles = hasManyThrough(user, role, {
  through: userUserRoles,
  throughForeignKey: "role_id",
});

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
  connectedAccount,
  newsletterSubscriberSends,
  post,
  role,
  subscriber,
  subscriberEmailOpen,
  userRole,
  userConnectedAccounts,
  connectedAccountUser,
  userPosts,
  postUser,
  postNewsletterSubscriberSends,
  subscriberNewsletterSends,
  userUserRoles,
  userRoles,
  postSubscriberEmailOpens,
  subscriberSubscriberEmailOpens,
};
