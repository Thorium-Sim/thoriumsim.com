import {Link} from "remix";
import {LoaderFunction, useLoaderData} from "remix";

export const loader: LoaderFunction = () => {
  return {time: new Date().toLocaleString()};
};

export default function Time() {
  const {time} = useLoaderData();
  return (
    <div>
      <Link to="/admin">Test</Link>
      {time}
    </div>
  );
}
