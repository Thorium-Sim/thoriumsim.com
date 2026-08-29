import { css, type Handle, type RemixNode } from "remix/ui";

import { mergeAssets } from "@pitlane/dev/runtime";
import clientAssets from "../entry.browser.ts?assets=client";
import serverAssets from "../entry.server.tsx?assets=ssr";

export interface DocumentProps {
  children?: RemixNode;
  head?: RemixNode;
}

export function Document(handle: Handle<DocumentProps>) {
  let assets = mergeAssets(clientAssets, serverAssets);

  return () => {
    let { children, head } = handle.props;
    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <style>
            {`@font-face {
  font-family: "Geom";
  font-style: normal;
  font-weight: 300 900;
  font-display: swap;
  src: url(/fonts/Geom-VariableFont_wght.woff2) format("woff2");
}
@font-face {
  font-family: "Geom";
  font-style: italic;
  font-weight: 300 900;
  font-display: swap;
  src: url(/fonts/Geom-Italic-VariableFont_wght.woff2) format("woff2");
}

@font-face {
  font-family: "Inter var";
  font-weight: 100 200 300 400 500 600 700 800 900;
  font-display: swap;
  font-style: normal;
  font-named-instance: "Regular";
  src: url("/fonts/Inter-roman.var.woff2") format("woff2");
}

@font-face {
  font-family: "Inter var";
  font-weight: 100 200 300 400 500 600 700 800 900;
  font-display: swap;
  font-style: italic;
  font-named-instance: "Italic";
  src: url("/fonts/Inter-italic.var.woff2") format("woff2");
}

html:has(.gallery-image) {
  overflow: hidden;
}
  @view-transition {
  navigation: auto;
}
`}
          </style>
          <link rel="alternate" type="application/rss+xml" title="Thorium Blog" href="/rss.xml" />
          <title>Thorium Nova</title>
          {assets.css.map((attrs) => (
            <link key={attrs.href} {...attrs} rel="stylesheet" />
          ))}
          <script async src={clientAssets.entry} type="module" />
          {assets.js.map((attrs) => (
            <link key={attrs.href} {...attrs} rel="modulepreload" />
          ))}
          {head}
        </head>
        <body
          mix={css({
            margin: 0,
            "& h1, & h2, & h3, & h4, & h5, & h6": {
              fontFamily: `Geom, Optima, Candara, 'Noto Sans', source-sans-pro, sans-serif`,
              marginTop: "0px",
              marginBottom: "0px",
            },
            background:
              "linear-gradient(to top in oklab, oklch(0.0932 0.1123 311.94), oklch(0.1584 0.0716 334)), black",
            backgroundAttachment: "fixed",
            "-webkit-font-smoothing": "antialiased",
            "-moz-osx-font-smoothing": "grayscale",
          })}
        >
          <main
            mix={css({
              // Light-mode design tokens (default).
              "--surface-0": "#dee2e6",
              "--surface-3": "#f0f4f7",
              "--surface-4": "#f7fbff",
              "--text-primary": "white",
              "--text-secondary": "#94989c",
              "--brand-blue": "#2dacf9",
              // Dark-mode overrides.
              "@media (prefers-color-scheme: dark)": {
                "--surface-0": "#1e2226",
                "--surface-3": "#313539",
                "--surface-4": "#363a3e",
                "--text-primary": "white",
                "--text-secondary": "#94989c",
              },
              "& *, & *::before, & *::after": { boxSizing: "border-box" },
              margin: 0,
              minHeight: "100vh",
              color: "var(--text-primary)",
              fontFamily: `"Inter var", Inter, "SF Pro Display", -apple-system, BlinkMacSystemFont, "San Francisco", "Helvetica Neue", Helvetica, Ubuntu, Roboto, Noto, "Segoe UI", Arial ,sans-serif`,
              fontSize: "16px",
              lineHeight: 1.5,
              WebkitFontSmoothing: "antialiased",
              MozOsxFontSmoothing: "grayscale",
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              "& a": {
                color: "var(--text-primary)",
                "&:hover": {
                  color: "var(--text-secondary)",
                },
              },
            })}
          >
            {children}
          </main>
        </body>
      </html>
    );
  };
}
