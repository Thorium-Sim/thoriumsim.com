import {Post, User} from "@prisma/client";
import {HeadersFunction, Link, LoaderFunction, useLoaderData} from "remix";
import {seoMeta} from "~/components/seoMeta";
import {useUser} from "~/context/user";
import {db} from "~/helpers/prisma.server";
import hero from "../../../images/hero.jpg";
export const loader: LoaderFunction = async ({request}) => {
  const posts = await db.post.findMany({
    where: {published: true, publishDate: {lte: new Date()}},
    orderBy: [{publishDate: "desc"}],
    select: {
      slug: true,
      title: true,
      excerpt: true,
      featuredImageUrl: true,
      publishDate: true,
    },
  });
  return {posts};
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
  const {posts} = useLoaderData<{roles: string[]; posts: Post[]}>();
  const user = useUser();
  return (
    <div className="mt-32 px-8 w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl sm:text-5xl font-bold">Thorium Nova Blog</h1>
        {user?.roles?.includes("admin") && (
          <Link to="/admin/blog/new" className="thorium-button">
            Add Post
          </Link>
        )}
      </div>
      <div className="space-y-16 my-16">
        {posts?.map(p => (
          <Link
            to={p.slug}
            key={p.slug}
            className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-8 text-white"
          >
            <img
              src={p.featuredImageUrl || hero}
              alt={p.title}
              className="sm:w-1/2 w-full rounded shadow-lg"
            />
            <div className="flex-1 min-w-[200px]">
              <h2 className="text-xl font-bold mb-4">{p.title}</h2>
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
