import { post, route } from "remix/routes";

export const routes = route({
  home: "/",
  about: "/about",
  aboutContent: "/about/content",
  gallery: "/gallery",
  galleryImage: "/gallery/:image",
  blogIndex: "/blog",
  blogPost: "/blog/:slug",
  blogPostContent: "/blog/:slug/content",
  rss: "/rss.xml",
  newsletterSubscribe: post("/email/subscribe"),
  emailTrackingPixel: "/email/trackingPixel",
  emailConfirmSubscription: "/email/confirmSubscription",
  emailConfirmSubscriptionFailed: "/email/confirmSubscription/failure",
  emailUnsubscribe: "/email/unsubscribe",
  admin: route("/admin", {
    index: "/",
    subscribers: "/subscribers",
    newsletters: "/newsletters",
    users: "/users",
  }),
  auth: {
    login: "/login",
    logout: "/logout",
    profile: "/profile",
    userPopover: "/userPopover",
    refresh: "/refresh",
    oauthClientMetadata: "/oauth/client-metadata.json",
    jwks: "/oauth/jwks.json",
    atmosphere: {
      login: post("/login/atmosphere"),
      createAccount: post("/createAccount/atmosphere"),
      callback: "/oauth/callback",
    },
  },
});
