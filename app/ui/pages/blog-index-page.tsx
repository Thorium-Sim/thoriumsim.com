import { css, type Handle } from "remix/ui";
import { Layout } from "../layout.tsx";
import { routes } from "../../routes.ts";
import { SeoMeta } from "../../utils/seoMeta.tsx";
import { NewsletterHead, NewsletterSignup } from "../../assets/newsletter-signup.tsx";
import { getEnv } from "../../utils/env.ts";

const hero = "https://assets.thoriumsim.com/posts/cover.avif";

export function BlogIndex(
  handle: Handle<{
    posts: {
      slug: string;
      title: string;
      excerpt: string | null;
      coverImageUrl: string | null;
      publishedAt: unknown;
    }[];
  }>,
) {
  let posts = handle.props.posts.map((p, i) => (
    <a
      href={routes.blogPost.href({ slug: p.slug })}
      key={p.slug}
      mix={css({
        alignItems: "center",
        justifyItems: "space-between",
        gap: "2rem",
        gridRow: "span 2",
        textDecoration: "none",
        "&:hover h2": { textDecoration: "underline", color: "white" },
        "&:hover p": { color: "white" },
      })}
      rmx-document
    >
      <img
        loading={i > 6 ? "lazy" : undefined}
        fetchpriority={i > 6 ? "high" : "low"}
        src={p.coverImageUrl || hero}
        alt={p.title}
        mix={css({
          width: "100%",
          borderRadius: "0.25rem",
          boxShadow: `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`,
          viewTransitionName: p.slug,
        })}
      />
      <div mix={css({})}>
        <h2>{p.title}</h2>
        <p>{p.excerpt}</p>
        <p mix={css({ color: "rgb(255 255 255 / 0.8)" })}>
          {p.publishedAt
            ? new Date(Number(p.publishedAt)).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : null}
        </p>
      </div>
    </a>
  ));
  return () => {
    return (
      <Layout
        head={
          <>
            <SeoMeta
              path={routes.blogIndex.href()}
              title="Blog - Thorium Nova"
              description="Read about the design and implementation of Thorium Nova."
            />
            <NewsletterHead />
          </>
        }
      >
        <h1
          mix={css({
            fontSize: "1.875rem",
            "@media(min-width: 640px)": {
              fontSize: "3rem",
            },
            marginBottom: "2rem",
          })}
        >
          Thorium Nova Blog
        </h1>

        <div
          mix={css({
            display: "grid",
            gridTemplateColumns: "1fr",
            gridTemplateRows: "1fr",
            gap: "2rem",
            gridAutoFlow: "row dense",
            "@media(min-width: 640px)": {
              gridTemplateColumns: "repeat(2, minmax(0,1fr))",
            },
          })}
        >
          <NewsletterSignup siteKey={getEnv().CLOUDFLARE_TURNSTILE_SITE_KEY} />

          {posts}
        </div>
      </Layout>
    );
  };
}
