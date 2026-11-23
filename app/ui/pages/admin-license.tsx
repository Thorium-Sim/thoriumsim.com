import { clientEntry, css, on, type Handle } from "remix/component";
import { routes } from "../../routes.ts";
import { AdminLayout } from "../adminLayout.tsx";
import { inputStyle } from "../styles/input.ts";
import { buttonStyles } from "../styles/button.ts";
import { Loader } from "../icons/Loader.tsx";

export const AdminLicensePage = clientEntry(
  import.meta.url,
  function AdminLicensePage(handle: Handle) {
    let error: string | undefined = undefined;
    let result: string | undefined = undefined;
    let pending = false;
    let complete = false;
    return () => {
      return (
        <AdminLayout>
          <form
            method="POST"
            action={routes.admin.licenseGenerate.href()}
            mix={[
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
                  } else {
                    result = await response.text();
                  }
                  complete = true;
                  pending = false;
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
            <h3 mix={css({ fontSize: "1.5rem", marginTop: 0 })}>Generate License Key</h3>
            <input mix={inputStyle} name="thoriumId" type="text" required />

            <button
              type="submit"
              mix={[
                buttonStyles,
                css({
                  "--color": "0.5104 0.1 350",
                  width: "100%",
                  display: "flex",
                  marginTop: "0.5rem",
                }),
              ]}
              disabled={pending}
            >
              {pending ? <Loader /> : "Submit"}
            </button>

            {error ? <p role="alert">{error}</p> : null}
            {complete ? (
              <p mix={css({ maxWidth: "16rem", wordBreak: "break-word" })}>{result}</p>
            ) : null}
          </form>
        </AdminLayout>
      );
    };
  },
);
