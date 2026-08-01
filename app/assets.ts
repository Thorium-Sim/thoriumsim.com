import { createAssetServer } from "remix/assets";
import { uiHmr } from "remix/ui-hmr/assets";

const rootDir = process.cwd();
const nodeEnv = process.env.NODE_ENV ?? "development";
const isDevelopment = nodeEnv === "development";
const isHmr = Boolean(isDevelopment && process.env.REMIX_NODE_HMR);

export const assetServer = createAssetServer({
  basePath: "/assets",
  rootDir,
  fileMap: {
    "app/*path": "app/*path",
    "node_modules/*path": "node_modules/*path",
  },
  allowFiles: [
    "app/assets/**",
    "node_modules/**",
    "app/routes.ts",
    "app/ui/styles/**",
    "app/ui/utils/**",
    "app/ui/icons/**",
  ],
  allowPackages: ["remix"],
  denyFiles: ["app/**/*.server.*"],
  sourceMaps: process.env.NODE_ENV === "development" ? "external" : undefined,
  hmr: isHmr
    ? async () => (await import("remix/node-hmr/runtime")).createBrowserHmrChannel()
    : undefined,
  scripts: {
    loaders: isHmr ? [uiHmr()] : undefined,
    define: {
      "process.env.NODE_ENV": JSON.stringify(nodeEnv ?? "development"),
    },
  },
});
