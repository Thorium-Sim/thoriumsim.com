import {Post} from "@prisma/client";
import {Link, LoaderFunction, useLoaderData} from "remix";
import {db} from "~/helpers/prisma.server";

export let loader: LoaderFunction = async () => {
  const posts = await db.post.findMany({
    select: {
      post_id: true,
      title: true,
      newsletterDate: true,
      newsletterSent: true,
      SubscriberEmailOpen: {
        distinct: ["broadcast_id", "subscriber_id"],
        select: {subscriber_email_open_id: true},
      },
      NewsletterSubscriberSends: {
        select: {
          id: true,
        },
      },
    },
    orderBy: [{newsletterSent: "asc"}, {newsletterDate: "desc"}],
    where: {
      OR: [{newsletterDate: {not: null}}, {newsletterSent: {equals: true}}],
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
        <h1 className="text-4xl font-extrabold mb-8 flex-1">Newsletters</h1>
        <Link to="/admin/blog/new" className="thorium-button">
          Add Post
        </Link>
      </div>

      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-900">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Title
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Newsletter Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Send Count
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Email Opens
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-50">
                        {post.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {post.newsletterDate &&
                          new Date(post.newsletterDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {post.NewsletterSubscriberSends.length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {post.SubscriberEmailOpen.length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {post.NewsletterSubscriberSends.length === 0
                          ? "N/A"
                          : `${Math.round(
                              (post.SubscriberEmailOpen.length /
                                post.NewsletterSubscriberSends.length) *
                                100
                            )}%`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
