import { Post } from "@prisma/client";
import { Link, useLoaderData } from "@remix-run/react";
import { HeadersFunction, LoaderFunction } from "@remix-run/server-runtime";
import { seoMeta } from "~/components/seoMeta";
import { useUser } from "~/context/user";
import { db } from "~/helpers/prisma.server";
import hero from "~/images/hero.jpg";
export const loader: LoaderFunction = async ({ request }) => {
  const posts = await db.post.findMany({
    where: { published: true, publishDate: { lte: new Date() } },
    orderBy: [{ publishDate: "desc" }],
    select: {
      slug: true,
      title: true,
      excerpt: true,
      featuredImageUrl: true,
      publishDate: true,
    },
  });
  return { posts };
};

export let headers: HeadersFunction = () => {
  return {
    "cache-control": `max-age=60`,
  };
};

export const meta = seoMeta({
  title: "Thorium Nova - Blog",
  description: "Blog posts about the Thorium Nova project.",
});

export default function Blog() {
  const { posts } = useLoaderData<{ roles: string[]; posts: Post[] }>();
  const user = useUser();
  return (
    <div className="mx-auto mt-32 w-full max-w-4xl px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold sm:text-5xl">Thorium Nova Blog</h1>
        {user?.roles?.includes("admin") && (
          <Link to="/admin/blog/new" className="thorium-button">
            Add Post
          </Link>
        )}
      </div>
      <div className="my-16 space-y-16">
        {posts?.map((p) => (
          <Link
            to={p.slug}
            key={p.slug}
            className="flex flex-wrap items-center justify-between gap-8 text-white sm:flex-nowrap"
          >
            <img
              src={
                p.featuredImageUrl === "null"
                  ? hero
                  : p.featuredImageUrl || hero
              }
              alt={p.title}
              className="w-full rounded shadow-lg sm:w-1/2"
            />
            <div className="min-w-[200px] flex-1">
              <h2 className="mb-4 text-xl font-bold">{p.title}</h2>
              <p className="text-white hover:text-white">{p.excerpt}</p>
              <p className="text-gray-400 hover:text-gray-400">
                {p.publishDate &&
                  new Date(p.publishDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
