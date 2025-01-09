import type {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import toast, { Toaster } from "react-hot-toast";

import tailwindStylesheetUrl from "./styles/tailwind.css";
import { commitSession, getSession, getUser } from "./session.server";
import { UserProvider } from "./context/user";
import { useEffect } from "react";
import Layout from "./components/Layout";
export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tailwindStylesheetUrl }];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Thorium Nova",
  viewport: "width=device-width,initial-scale=1",
});

type LoaderData = {
  user: Awaited<ReturnType<typeof getUser>>;
  toast?: any;
  error?: any;
};

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request);
  const toast = session.get("toast");
  const error = session.get("error");
  return json<LoaderData>(
    {
      toast,
      error,
      user: await getUser(request),
    },
    { headers: { "set-cookie": await commitSession(session) } }
  );
};

export default function App() {
  const { toast: toastMessage, error, user } = useLoaderData<LoaderData>();
  useEffect(() => {
    if (toastMessage && typeof toastMessage === "string") {
      toast(toastMessage);
    }
    if (error && typeof error === "string") {
      toast.error(error);
    }
  }, [toastMessage, error]);

  return (
    <html lang="en" className="h-full">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Exo+2:wght@500&display=swap"
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Thorium Blog"
          href="/rss.xml"
        />
        <Meta />
        <Links />
      </head>
      <body
        className="min-h-full bg-tgray-800 bg-gradient-to-t from-tgray-500 to-tgray-900 bg-no-repeat text-white"
        style={{ backgroundAttachment: "fixed" }}
      >
        <UserProvider user={user as any}>
          <Layout>
            <Outlet />
          </Layout>
        </UserProvider>
        <Toaster position="bottom-left" />

        <ScrollRestoration />
        <Scripts />
        <LiveReload />

        <script
        id="counterscale-script"
        data-site-id="thoriumsim.com"
        src="https://analytics.ralexanderson.com/tracker.js"
        defer
        ></script>
      </body>
    </html>
  );
}
