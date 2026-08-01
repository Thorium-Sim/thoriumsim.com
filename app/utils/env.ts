import { readFileSync } from "node:fs";
import { object, optional, parse, string, type InferOutput } from "remix/data-schema";

const envSchema = object({
  CLOUDFLARE_ACCOUNT_ID: string(),
  CLOUDFLARE_SECRET_ACCESS_KEY: string(),
  CLOUDFLARE_ACCESS_KEY_ID: string(),
  CLOUDFLARE_R2_BUCKET: string(),
  CLOUDFLARE_TURNSTILE_SITE_KEY: string(),
  CLOUDFLARE_TURNSTILE_SECRET: string(),
  AWS_ACCESS_KEY_ID: optional(string()),
  AWS_SECRET_ACCESS_KEY: optional(string()),
  AWS_SES_ENDPOINT: optional(string()),
  FROM_ADDRESS: optional(string()),
  SESSION_SECRET: string(),
  APP_ORIGIN: string(),
});
let env: InferOutput<typeof envSchema> | null = null;

export function getEnv() {
  if (!env) {
    let tempEnv: Record<string, string | undefined> = process.env;
    if (process.env.NODE_ENV === "development") {
      for (const line of readFileSync("./.env", "utf-8").split("\n")) {
        if (line.startsWith("//") || line.startsWith("#")) continue;
        let [key, value] = line.split("=");
        if (value.startsWith('"')) value = value.slice(1);
        if (value.endsWith('"')) value = value.slice(0, value.length - 1);
        if (value.startsWith("'")) value = value.slice(1);
        if (value.endsWith("'")) value = value.slice(0, value.length - 1);
        tempEnv[key] = value;
      }
    }
    env = parse(envSchema, tempEnv);
  }
  return env;
}
