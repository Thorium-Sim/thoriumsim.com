import {LoaderFunction, useLoaderData} from "remix";
import {db} from "~/helpers/prisma.server";

const Stat = ({title, number}: {title: string; number: number}) => {
  return (
    <div className="bg-gray-700 rounded-lg w-full p-8">
      <span className="block text-3xl font-bold">{title}</span>
      <span className="block text-center text-6xl font-black mt-8">
        {number}
      </span>
    </div>
  );
};

export const loader: LoaderFunction = async () => {
  const activeCount = db.subscriber
    .aggregate({_count: {_all: true}, where: {status: {equals: "active"}}})
    .then(res => res._count._all);
  const pendingCount = db.subscriber
    .aggregate({_count: {_all: true}, where: {status: {equals: "pending"}}})
    .then(res => res._count._all);
  const unsubscribedCount = db.subscriber
    .aggregate({
      _count: {_all: true},
      where: {status: {equals: "unsubscribed"}},
    })
    .then(res => res._count._all);
  const userCount = db.user
    .aggregate({_count: {_all: true}})
    .then(res => res._count._all);
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
      <h1 className="text-4xl font-extrabold mb-8 flex-1">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
