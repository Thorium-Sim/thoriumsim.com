import ReactDOMServer from "react-dom/server";
import type {EntryContext} from "remix";
import {RemixServer} from "remix";
import dotenv from "dotenv";
import {generateFeed} from "./helpers/rss";
import {md5} from "./helpers/md5";
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
  let time = Date.now();
  const etag = md5(markup);
  if (etag === request.headers.get("if-none-match")) {
    return new Response("", {
      status: 304,
    });
  }
  console.log(Date.now() - time);
  return new Response("<!DOCTYPE html>" + markup, {
    status: responseStatusCode,
    headers: {
      ...Object.fromEntries(responseHeaders),
      "Content-Type": "text/html",
      ETag: etag,
    },
  });
}
