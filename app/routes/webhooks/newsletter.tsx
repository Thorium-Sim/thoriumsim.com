import {ActionFunction} from "remix";

export const action: ActionFunction = ({request}) => {
  console.log("Newsletter Websocket");
  console.log(request.headers.get("authorization"));
  return "Done.";
};
export default function Newsletter() {
  return null;
}
