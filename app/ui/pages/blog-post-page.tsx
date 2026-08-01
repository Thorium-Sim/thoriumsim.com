import { css, Frame, type Handle } from "remix/ui";

import { Document } from "../document.tsx";
import Header from "../Header.tsx";
import { routes } from "../../routes.ts";
import { proseStyles } from "../../utils/proseStyles.ts";
import { SeoMeta } from "../../utils/seoMeta.tsx";
import { NewsletterHead, NewsletterSignup } from "../../assets/newsletter-signup.tsx";
import { getEnv } from "../../utils/env.ts";

export function BlogPostPage(
  handle: Handle<{
    post: {
      title: string;
      publishedAt: number;
      coverImageUrl: string;
      slug: string;
      excerpt: string;
    };
  }>,
) {
  const post = handle.props.post;
  return () => (
    <Document
      head={
        <>
          <SeoMeta
            path={routes.blogPost.href({ slug: post.slug })}
            title={`${post.title} - Thorium Nova`}
            description={post.excerpt}
            imageUrl={post.coverImageUrl}
          />
          <NewsletterHead />
        </>
      }
    >
      <Header />

      <h1
        mix={css({
          marginTop: "4rem",
          textAlign: "center",
          fontSize: "1.5rem",
          "@media (min-width: 640px)": {
            fontSize: "3rem",
          },
        })}
      >
        {post.title}
      </h1>
      <div
        mix={css({
          textAlign: "center",
          marginInline: "auto",
          marginBlock: "2rem",
        })}
      >
        {new Date(post.publishedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </div>
      {post.coverImageUrl &&
        post.coverImageUrl !== "null" &&
        !post.coverImageUrl.endsWith("posts/cover.avif") && (
          <img
            mix={css({
              marginBlock: "3rem",
              width: "100%",
              boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
              marginInline: "auto",
              "@media (min-width: 640px)": {
                marginBlock: "6rem",
                borderRadius: "0.5rem",
                width: "75%",
              },
              viewTransitionName: post.slug,
            })}
            className="my-12 mx-auto w-full shadow-xl sm:my-24 sm:w-3/4 sm:rounded-lg"
            src={post.coverImageUrl}
            alt={post.title}
          />
        )}
      <div
        mix={[
          css({
            maxWidth: "65ch",
            width: "100%",
            paddingInline: "1rem",
            marginInline: "auto",
            marginBottom: "4rem",
          }),
          proseStyles,
        ]}
      >
        <Frame src={routes.blogPostContent.href({ slug: post.slug })} />
        <NewsletterSignup siteKey={getEnv().CLOUDFLARE_TURNSTILE_SITE_KEY} />
      </div>
    </Document>
  );
}
