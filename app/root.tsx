import {
  Link,
  LinksFunction,
  LoaderFunction,
  useActionData,
  useCatch,
  useMatches,
} from "remix";
import {Meta, Links, Scripts, useLoaderData, LiveReload} from "remix";
import {Outlet} from "remix";
import {Toaster} from "react-hot-toast";
import {UserProvider} from "./context/user";

import stylesUrl from "./styles/tailwind.css";
import {getSession} from "./auth/localSession.server";
import {authenticator} from "./auth/auth.server";
import Layout from "./components/Layout";
import ErrorPage from "./components/Errors";

export const loader: LoaderFunction = async ({request}) => {
  const session = await getSession(request.headers.get("Cookie") || "");
  const userData = session.get(authenticator.sessionKey);
  if (userData) {
    return {user: userData};
  }
  return {user: null};
};

function Document({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <html lang="en">
      <head>
        {title ? <title>{title}</title> : null}
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="stylesheet" href={stylesUrl} />
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
  let {user} = useLoaderData();
  const matches = useMatches();
  if (matches.some(m => m.handle?.api_only)) {
    return <Outlet />;
  }
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
    <Document title="Uh-oh!">
      <Layout>
        <ErrorPage
          title="An error has occured."
          text={error.message}
        ></ErrorPage>
      </Layout>
    </Document>
  );
}

export function CatchBoundary() {
  let caught = useCatch();

  switch (caught.status) {
    // add whichever other status codes you want to handle
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#client_error_responses
    case 401:
    case 404:
      return (
        <Document title={`Thorium - ${caught.status} ${caught.statusText}`}>
          <Layout>
            <ErrorPage
              title="404"
              text={
                <Link
                  to="/"
                  className="text-thorium-300 hover:text-thorium-400 mt-8 pointer-events-auto z-50"
                >
                  Return Home
                </Link>
              }
            />
          </Layout>
        </Document>
      );

    default:
      throw new Error(
        `Unexpected caught response with status: ${caught.status}`
      );
  }
}
