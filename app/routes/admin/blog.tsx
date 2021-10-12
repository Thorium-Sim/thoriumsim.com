import {Post} from "@prisma/client";
import {FaSpinner} from "react-icons/fa";
import {
  ActionFunction,
  Link,
  LoaderFunction,
  redirect,
  useTransition,
  useLoaderData,
  useSubmit,
} from "remix";
import {parseBody} from "remix-utils";
import {commitSession, getSession} from "~/auth/localSession.server";
import {db} from "~/helpers/prisma.server";

export let action: ActionFunction = async ({request}) => {
  const session = await getSession(request.headers.get("Cookie") || "");

  const body = await parseBody(request);
  if (request.method === "PUT") {
    await db.post.update({
      where: {post_id: Number(body.get("post_id"))},
      data: {published: body.get("published") === "true"},
    });
    session.flash(
      "toast",
      `Post ${body.get("published") === "true" ? "published!" : "unpublished!"}`
    );
  }

  return redirect("/admin/blog", {
    headers: {"Set-Cookie": await commitSession(session)},
  });
};
export let loader: LoaderFunction = async () => {
  const posts = await db.post.findMany({
    select: {
      publishDate: true,
      post_id: true,
      title: true,
      published: true,
    },
    orderBy: [{published: "asc"}, {publishDate: "desc"}],
    where: {OR: [{published: true}, {newsletterSent: false}]},
  });
  return posts;
};

export default function Blog() {
  const posts = useLoaderData<Post[]>();
  const submit = useSubmit();
  const pendingForm = useTransition().submission;
  return (
    <div>
      <div className="flex items-center">
        <h1 className="text-4xl font-extrabold mb-8 flex-1">Blog Posts</h1>
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
                      Publish Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Published
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
                        {post.publishDate &&
                          new Date(post.publishDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 flex gap-4">
                        <input
                          name="published"
                          type="checkbox"
                          checked={
                            pendingForm?.formData.get("post_id") ===
                            post.post_id.toString()
                              ? pendingForm?.formData.get("published") ===
                                "true"
                                ? true
                                : false
                              : post.published || false
                          }
                          onChange={e => {
                            submit(
                              {
                                post_id: post.post_id.toString(),
                                published: e.currentTarget.checked.toString(),
                              },
                              {method: "put"}
                            );
                          }}
                        />
                        {pendingForm?.formData.get("post_id")?.toString() ===
                          post.post_id.toString() && (
                          <FaSpinner className="animate-spinner" />
                        )}
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
