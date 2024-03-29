import { Subscriber } from "@prisma/client";
import { useLoaderData } from "@remix-run/react";
import { LoaderFunction } from "@remix-run/server-runtime";
import { db } from "~/helpers/prisma.server";

export const handle = {
  noLayout: true,
};

export const loader: LoaderFunction = async () => {
  return await db.subscriber.findMany({
    select: {
      subscriber_id: true,
      email: true,
      created_at: true,
      status: true,
    },
    orderBy: {
      created_at: "desc",
    },
  });
};
export default function Blog() {
  const subscriber = useLoaderData<Subscriber[]>();

  return (
    <div>
      <div className="flex items-center">
        <h1 className="mb-8 flex-1 text-4xl font-extrabold">Subscribers</h1>
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
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      Created At
                    </th>
                    <th scope="col" className="relative px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {subscriber.map((subscriber, subIndex) => (
                    <tr
                      key={subscriber.subscriber_id}
                      className={
                        subIndex % 2 === 0 ? "bg-gray-900" : "bg-gray-800"
                      }
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-50">
                        {subscriber.email}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">
                        {subscriber.status}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">
                        {new Date(subscriber.created_at).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium"></td>
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
