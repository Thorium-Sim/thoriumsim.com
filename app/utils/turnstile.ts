import { getEnv } from "./env.ts";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstileToken(token: string) {
  const response = await fetch(SITEVERIFY_URL, {
    method: "POST",
    body: JSON.stringify({
      secret: getEnv().CLOUDFLARE_TURNSTILE_SECRET,
      response: token,
    }),
    headers: { "Content-Type": "application/json" },
  });

  const result = await response.json();

  if (!result.success) {
    if (result["error-codes"].includes("timeout-or-duplicate")) {
      throw new Error(
        "Captcha token has timed out or already been used. Reload the page and try again.",
      );
    }
    throw new Error("Error validating captcha. Reload the page and try again.");
  }
}
