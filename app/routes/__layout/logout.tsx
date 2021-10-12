import {LoaderFunction, redirect} from "remix";
import {destroySession, getSession} from "~/auth/localSession.server";
import {User} from "../../helpers/types";

export const loader: LoaderFunction = async ({request}) => {
  let session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user") as User;
  // TODO: Implement logout
  session.unset("user");
  return redirect("/", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
};

export default function Logout() {
  return null;
}
