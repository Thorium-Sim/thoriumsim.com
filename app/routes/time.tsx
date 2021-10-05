import {LoaderFunction, useRouteData} from "remix";

export const loader: LoaderFunction = () => {
  return {time: new Date().toLocaleString()};
};

export default function Time() {
  const {time} = useRouteData();
  return <div>{time}</div>;
}
