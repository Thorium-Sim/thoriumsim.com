import { clientEntry, css, on, type Handle } from "remix/ui";
import { Turnstile } from "./turnstile/index.tsx";
import { input } from "remix/ui/input";
import { inputStyle } from "../ui/styles/input.ts";
import { button } from "remix/ui/button";
import { buttonStyles } from "../ui/styles/button.ts";
import { routes } from "../routes.ts";
import { Loader } from "../ui/icons/Loader.tsx";

export function NewsletterHead() {
  return () => <link rel="preconnect" href="https://challenges.cloudflare.com" />;
}
export const NewsletterSignup = clientEntry(
  import.meta.url,
  function NewsletterSignup(handle: Handle<{ siteKey: string }>) {
    const siteKey = handle.props.siteKey;
    let turnstileComplete = false;

    let error: string | undefined = undefined;
    let pending = false;
    let complete = false;
    return () => {
      return (
        <form
          method="POST"
          action={routes.newsletterSubscribe.href()}
          mix={[
            css({
              gridRow: "3",
              "@media(min-width: 640px)": {
                gridRow: "1",
                gridColumn: "2",
              },
              width: "100%",
              background: "oklch(0.0584 0.1716 311)",
              color: "white",
              border: "solid 1px oklch(0.2584 0.1716 311)",
              paddingBlock: "0.5rem",
              paddingInline: "2rem",
              borderRadius: "0.5rem",
            }),
            on("submit", async (event, signal) => {
              let form = event.currentTarget;
              event.preventDefault();
              error = undefined;
              pending = true;
              handle.update();
              try {
                let response = await fetch(form.action, {
                  body: new FormData(form),
                  method: form.method,
                  signal,
                });
                if (signal.aborted) return;
                if (!response.ok) {
                  error = await response.text();
                  if (signal.aborted) return;
                  pending = false;
                  handle.update();
                  return;
                }
                complete = true;
                handle.update();
              } catch (caught) {
                if (signal.aborted) return;
                error = caught instanceof Error ? caught.message : "Unable to save album";
                pending = false;
                handle.update();
              }
            }),
          ]}
        >
          {complete ? (
            <>
              <h3 mix={css({ fontSize: "1.5rem", marginTop: 0 })}>You've Signed Up!</h3>
              <p>Now check your email to confirm your subscription.</p>
            </>
          ) : (
            <>
              <h3 mix={css({ fontSize: "1.5rem", marginTop: 0 })}>Join the Newsletter</h3>
              <p>
                Sign up to get regular updates, find ways to contribute, and get access to exclusive
                content.
              </p>
              <input
                mix={[input({ size: "lg" }), inputStyle]}
                autoComplete="email"
                name="email"
                type="email"
                required
                placeholder="Your email address"
              />

              <Turnstile
                siteKey={siteKey}
                options={{ appearance: "interaction-only", size: "flexible" }}
                onSuccess={() => {
                  turnstileComplete = true;
                  handle.update();
                }}
              />

              <button
                type="submit"
                mix={[
                  button(),
                  buttonStyles,
                  css({
                    "--color": "0.5104 0.1 350",
                    width: "100%",
                    display: "flex",
                    marginTop: "0.5rem",
                  }),
                ]}
                disabled={!turnstileComplete || pending}
              >
                {pending ? <Loader /> : "Subscribe"}
              </button>
              <p mix={css({ fontSize: "0.8rem", color: "rgba(255 255 255 / 0.8)" })}>
                We won't send you spam. Unsubscribe at any time.
              </p>
            </>
          )}
          {error ? <p role="alert">{error}</p> : null}
        </form>
      );
    };
  },
);
