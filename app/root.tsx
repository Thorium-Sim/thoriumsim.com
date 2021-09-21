import {LinksFunction, LoaderFunction, useMatches} from "remix";
import {Meta, Links, Scripts, useRouteData, LiveReload} from "remix";
import {Outlet} from "react-router-dom";
import {Toaster} from "react-hot-toast";
import {UserProvider} from "./context/user";

import stylesUrl from "./styles/tailwind.css";
import {getSession} from "./auth/localSession.server";
import {authenticator} from "./auth/auth.server";
import Layout from "./components/Layout";
import ErrorPage from "./components/Errors";
export let links: LinksFunction = () => {
  return [
    {rel: "stylesheet", href: stylesUrl},
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Exo+2:wght@500&display=swap",
    },
  ];
};

export const loader: LoaderFunction = async ({request}) => {
  const session = await getSession(request.headers.get("Cookie") || "");
  const userData = session.get(authenticator.sessionKey);
  if (userData) {
    return {user: userData};
  }
  return {user: null};
};

function Document({children}: {children: React.ReactNode}) {
  let matches = useMatches();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <Meta />
        <Links />
      </head>
      <body
        className="h-full bg-tgray-800 from-tgray-500 to-tgray-900 bg-no-repeat text-white"
        style={{backgroundAttachment: "fixed"}}
      >
        {children}

        <Scripts />
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}

export default function App() {
  let {user} = useRouteData();
  return (
    <Document>
      <UserProvider user={user}>
        <Outlet />
        <Toaster position="bottom-left" />
      </UserProvider>
      <Scripts />
    </Document>
  );
}

export function ErrorBoundary({error}: {error: Error}) {
  return (
    <Document>
      <Layout>
        <ErrorPage
          title="An error has occured."
          text={error.message}
        ></ErrorPage>
      </Layout>
    </Document>
  );
}
