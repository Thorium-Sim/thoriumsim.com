import { Post, User } from "@prisma/client";
import { json } from "remix-utils";
import { seoMeta } from "~/components/seoMeta";
import { db } from "~/helpers/prisma.server";
import { processMarkdown } from "~/helpers/processMarkdown";
import { useEffect } from "react";
import BlogPost from "~/components/BlogPost";
import { HeadersFunction, LoaderFunction } from "@remix-run/server-runtime";
import { useLoaderData } from "@remix-run/react";

export const meta = seoMeta(({ data }): Record<string, string> => {
  if (data.notFound) return { title: `Thorium Nova - Page Not Found` };
  return {
    title: `${data.title} - Thorium Nova`,
    description: data.excerpt,
    image: data.featuredImageUrl,
  };
});

export const loader: LoaderFunction = async ({ params }) => {
  const { slug } = params;
  const post = await db.post.findUnique({
    where: { slug },
    include: {
      User: { select: { displayName: true, profilePictureUrl: true } },
    },
  });
  if (!post) throw json({ notFound: true }, { status: 404 });

  return { ...post, body: await processMarkdown(post?.body || "") };
};

export let headers: HeadersFunction = () => {
  const allDay = 3600 * 24;
  return {
    "cache-control": `max-age=3600 s-maxage=${allDay}`,
  };
};

export default function PostPage() {
  const post = useLoaderData<Post & { User: User }>();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="mt-32">
      <BlogPost post={post} />
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div>
      <h1>Error</h1>
      <p>{error.message}</p>
      <p>The stack trace is:</p>
      <pre>{error.stack}</pre>
    </div>
  );
}
