import {ReactNode} from "react";
import Stars from "./Stars";
export {styles} from "./Stars";

export default function ErrorPage({
  title,
  text,
}: {
  title: string;
  text: ReactNode;
}) {
  return (
    <Stars>
      <h1 className="font-extrabold text-6xl mb-8">{title}</h1>
      {text}
    </Stars>
  );
}
