import { useLoaderData } from "@remix-run/react";
import { LoaderFunction } from "@remix-run/server-runtime";
import { db } from "~/helpers/prisma.server";

export const handle = {
  noLayout: true,
};

const Stat = ({ title, number }: { title: string; number: number }) => {
  return (
    <div className="w-full rounded-lg bg-gray-700 p-8">
      <span className="block text-3xl font-bold">{title}</span>
      <span className="mt-8 block text-center text-6xl font-black">
        {number}
      </span>
    </div>
  );
};

export const loader: LoaderFunction = async () => {
  const activeCount = db.subscriber
    .aggregate({
      _count: { _all: true },
      where: { status: { equals: "active" } },
    })
    .then((res) => res._count._all);
  const pendingCount = db.subscriber
    .aggregate({
      _count: { _all: true },
      where: { status: { equals: "pending" } },
    })
    .then((res) => res._count._all);
  const unsubscribedCount = db.subscriber
    .aggregate({
      _count: { _all: true },
      where: { status: { equals: "unsubscribed" } },
    })
    .then((res) => res._count._all);
  const userCount = db.user
    .aggregate({ _count: { _all: true } })
    .then((res) => res._count._all);
  return await Promise.all([
    activeCount,
    pendingCount,
    unsubscribedCount,
    userCount,
  ]);
};
export default function Dashboard() {
  const [activeCount, pendingCount, unsubscribedCount, userCount] =
    useLoaderData();
  return (
    <div>
      <h1 className="mb-8 flex-1 text-4xl font-extrabold">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat title="Active Subscribers" number={activeCount}></Stat>
        <Stat title="Pending Subscribers" number={pendingCount}></Stat>
        <Stat
          title="Unsubscribed Subscribers"
          number={unsubscribedCount}
        ></Stat>
        <Stat title="Users" number={userCount}></Stat>
      </div>
    </div>
  );
}
