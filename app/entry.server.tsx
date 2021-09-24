import ReactDOMServer from "react-dom/server";
import type {EntryContext} from "remix";
import {RemixServer} from "remix";
import dotenv from "dotenv";
dotenv.config({path: ".env"});
export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  const url = new URL(request.url);
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
