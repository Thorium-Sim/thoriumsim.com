import {Post} from "@prisma/client";
import {Link, LoaderFunction, useRouteData} from "remix";
import {db} from "~/helpers/prisma.server";

export let loader: LoaderFunction = async () => {
  const posts = await db.post.findMany({
    orderBy: [{published: "desc"}, {publishDate: "desc"}],
  });
  return posts;
};

export default function Blog() {
  const posts = useRouteData<Post[]>();
  return (
    <div>
      <h1 className="text-4xl font-extrabold mb-8">Blog Posts</h1>

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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        <input
                          name="published"
                          type="checkbox"
                          readOnly
                          checked={post.published || false}
                        />
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
