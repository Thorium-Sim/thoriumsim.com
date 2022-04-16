/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  cacheDirectory: "./node_modules/.cache/remix",
  ignoredRouteFiles: [".*", "**/*.css", "**/*.test.{js,jsx,ts,tsx}"],
  serverDependenciesToBundle: [
    /^react-markdown/,
    /^rehype.*/,
    /^remark.*/,
    /^unified.*/,
    /^micromark.*/,
    /^mdast.*/,
    /^unist.*/,
    /^hast.*/,
    /^property-information.*/,
    /^vfile.*/,
    /^space-separated-tokens/,
    /^comma-separated-tokens/,
    /^trough/,
    /^html-void-elements/,
    /^web-namespaces/,
    /^zwitch/,
    /^bail/,
    /^ccount/,
    /^decode-named-character-reference/,
    /^markdown-table/,
    /^character-entities/,
  ],
};
