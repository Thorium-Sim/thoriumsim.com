import { createController } from "remix/router";

import { routes } from "../routes.ts";
import { HomePage } from "../ui/pages/home-page.tsx";
import { GalleryImage, GalleryPage } from "../ui/pages/gallery-page.tsx";
import { AboutPage } from "../ui/pages/about-page.tsx";
import { createHtmlResponse } from "remix/response/html";
import { BlogIndex } from "../ui/pages/blog-index-page.tsx";
import { getAboutContent, getPost, listPosts } from "../utils/r2.ts";
import { BlogPostPage } from "../ui/pages/blog-post-page.tsx";
import { generateFeed } from "../utils/rss.ts";
import { cachified } from "@epic-web/cachified";
import { cache } from "../utils/cache.ts";
import {
  confirmSubscription,
  subscribe,
  trackEmailOpen,
  unsubscribe,
} from "../utils/newsletter.ts";
import { redirect } from "remix/response/redirect";
import {
  SubscriptionConfirmationFailedPage,
  SubscriptionConfirmationPage,
} from "../ui/pages/subscription-confirmation-page.tsx";
import { UnsubscribeConfirmationPage } from "../ui/pages/unsubscribe-confirmation-page.tsx";
import { formData } from "remix/middleware/form-data";

function getRssContent() {
  return cachified({
    cache,
    key: "rss",
    ttl: 30_000, // fresh for 30s
    staleWhileRevalidate: 1000 * 60 * 60 * 24, // serve stale up to 1 day while refetching in bg

    async getFreshValue() {
      return await generateFeed();
    },
  });
}

export default createController(routes, {
  actions: {
    home(context) {
      return context.render(<HomePage />);
    },
    about(context) {
      return context.render(<AboutPage />);
    },
    async aboutContent() {
      const { html } = await getAboutContent();
      return createHtmlResponse(html);
    },
    gallery(context) {
      return context.render(<GalleryPage />);
    },
    galleryImage(context) {
      return context.render(<GalleryImage image={context.params.image} />);
    },
    async blogIndex(context) {
      const posts = await listPosts();
      return context.render(<BlogIndex posts={posts} />);
    },
    async blogPost(context) {
      const post = await getPost(context.params.slug);
      return context.render(<BlogPostPage post={post} />);
    },
    async blogPostContent(context) {
      const post = await getPost(context.params.slug);
      return createHtmlResponse(post.html);
    },
    async rss() {
      return new Response(await getRssContent(), {
        headers: { "Content-Type": "application/rss+xml" },
      });
    },
    async emailTrackingPixel(context) {
      const email = context.url.searchParams.get("email");
      const broadcastId = context.url.searchParams.get("broadcastId");
      await trackEmailOpen(email, broadcastId);
      return new Response("", {
        headers: { Location: "https://assets.thoriumsim.com/pixel.png" },
        status: 307,
      });
    },
    async emailConfirmSubscription(context) {
      const email = context.url.searchParams.get("email");
      const subscribeToken = context.url.searchParams.get("subscribeToken");
      try {
        if (email && subscribeToken) {
          await confirmSubscription(email, subscribeToken);
          return redirect(routes.emailConfirmSubscription.href());
        }
      } catch {
        return redirect(routes.emailConfirmSubscriptionFailed.href());
      }

      return context.render(<SubscriptionConfirmationPage />);
    },
    async emailConfirmSubscriptionFailed(context) {
      return context.render(<SubscriptionConfirmationFailedPage />);
    },
    async emailUnsubscribe(context) {
      const email = context.url.searchParams.get("email");
      if (email) {
        await unsubscribe(email);
        return redirect(routes.emailUnsubscribe.href());
      }

      return context.render(<UnsubscribeConfirmationPage />);
    },

    newsletterSubscribe: {
      middleware: [formData()],
      handler: async (context) => {
        // @ts-expect-error The formData middleware should
        // be adding the type here
        const email = context.formData.get("email");
        // @ts-expect-error
        const turnstileResponse = context.formData.get("cf-turnstile-response");

        try {
          await subscribe(email, turnstileResponse);
          return new Response();
        } catch (error) {
          return new Response(
            error instanceof Error
              ? error.message
              : "Error validating captcha. Reload the page and try again.",
            { status: 400 },
          );
        }
      },
    },
  },
});
