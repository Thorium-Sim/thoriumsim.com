import { Post } from "@prisma/client";
import { Link, useLoaderData } from "@remix-run/react";
import { LoaderFunction } from "@remix-run/server-runtime";
import { db } from "~/helpers/prisma.server";

export const handle = {
  noLayout: true,
};

export let loader: LoaderFunction = async () => {
  const posts = await db.post.findMany({
    select: {
      post_id: true,
      title: true,
      slug: true,
      newsletterDate: true,
      newsletterSent: true,
      SubscriberEmailOpen: {
        distinct: ["broadcast_id", "subscriber_id"],
        select: { subscriber_email_open_id: true },
      },
      NewsletterSubscriberSends: {
        select: {
          id: true,
        },
      },
    },
    orderBy: [{ newsletterSent: "asc" }, { newsletterDate: "desc" }],
    where: {
      OR: [
        { newsletterDate: { not: null } },
        { newsletterSent: { equals: true } },
      ],
    },
  });
  return posts;
};

export default function Blog() {
  const posts = useLoaderData<
    (Post & {
      SubscriberEmailOpen: unknown[];
      NewsletterSubscriberSends: unknown[];
    })[]
  >();

  return (
    <div>
      <div className="flex items-center">
        <h1 className="mb-8 flex-1 text-4xl font-extrabold">Newsletters</h1>
        <Link to="/admin/blog/new" className="thorium-button">
          Add Post
        </Link>
      </div>

      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-900">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      Title
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      Newsletter Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      Send Count
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      Email Opens
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      Open Rate
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post, postIndex) => (
                    <tr
                      key={post.post_id}
                      className={
                        postIndex % 2 === 0 ? "bg-gray-900" : "bg-gray-800"
                      }
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-50">
                        <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">
                        {post.newsletterDate &&
                          new Date(post.newsletterDate).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">
                        {post.NewsletterSubscriberSends.length}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">
                        {post.SubscriberEmailOpen.length}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">
                        {post.NewsletterSubscriberSends.length === 0
                          ? "N/A"
                          : `${Math.round(
                              (post.SubscriberEmailOpen.length /
                                post.NewsletterSubscriberSends.length) *
                                100
                            )}%`}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <Link
                          to={`/admin/blog/edit/${post.post_id}`}
                          className="text-indigo-400 hover:text-indigo-700"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
