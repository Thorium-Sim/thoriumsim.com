import ReactDOMServer from "react-dom/server";
import type {EntryContext} from "remix";
import {RemixServer} from "remix";
import dotenv from "dotenv";
import {generateFeed} from "./helpers/rss";
dotenv.config({path: ".env"});
export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  const url = new URL(request.url);
  if (url.pathname === "/rss.xml") {
    return new Response(await generateFeed(), {
      status: 200,
      headers: {
        "Content-Type": "text/xml",
      },
    });
  }
  if (url.pathname === "/webhooks/success") {
    return new Response(JSON.stringify({success: true}), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  let markup = ReactDOMServer.renderToString(
    <RemixServer context={remixContext} url={request.url} />
  );

  return new Response("<!DOCTYPE html>" + markup, {
    status: responseStatusCode,
    headers: {
      ...Object.fromEntries(responseHeaders),
      "Content-Type": "text/html",
    },
  });
}
