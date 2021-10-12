import {useEffect} from "react";
import toast from "react-hot-toast";
import {Outlet} from "remix";
import {json, LoaderFunction, useLoaderData} from "remix";
import {seoMeta} from "~/components/seoMeta";
import Layout from "~/components/Layout";
import {commitSession, getSession} from "~/auth/localSession.server";

export const meta = seoMeta();

export const loader: LoaderFunction = async ({request}) => {
  let session = await getSession(request.headers.get("Cookie") || "");
  const toast = session.get("toast");
  const error = session.get("error");
  return json(
    {toast, error},
    {headers: {"set-cookie": await commitSession(session)}}
  );
};
export default function LayoutRoute() {
  const {toast: toastMessage, error} = useLoaderData<{
    toast?: string;
    error?: string;
  }>();
  useEffect(() => {
    if (toastMessage && typeof toastMessage === "string") {
      toast(toastMessage);
    }
    if (error && typeof toastMessage === "string") {
      toast.error(error);
    }
  }, [toastMessage, error]);
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
