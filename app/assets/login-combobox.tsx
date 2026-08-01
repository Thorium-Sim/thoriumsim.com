import { clientEntry, createMixin, css, on, type Handle } from "remix/ui";
import * as combobox from "remix/ui/combobox/primitives";
import { input } from "remix/ui/input";
import { routes } from "../routes.ts";
import { FallbackImage } from "./fallback-image.tsx";
import { modalBackground } from "../ui/styles/modalBackground.ts";
import { debounce } from "../ui/utils/debounce.ts";
import { button } from "remix/ui/button";
import { buttonStyles } from "../ui/styles/button.ts";
import { ChevronRight } from "../ui/icons/ChevronRight.tsx";
import { Loader } from "../ui/icons/Loader.tsx";
import { inputStyle } from "../ui/styles/input.ts";

const ATPROTO_TYPEAHEAD_ENDPOINT = `https://typeahead.waow.tech/xrpc/tech.waow.typeahead.searchActors?limit=10`;

class OpenComboboxEvent extends Event {
  static name = "open-combobox" as const;
  constructor() {
    super(OpenComboboxEvent.name);
  }
}

export const LoginComboboxProvider = clientEntry(
  import.meta.url,
  function LoginComboboxProvider(
    handle: Handle<
      {
        savedHandles: {
          handle: string;
          avatar: string | undefined;
          lastUsed: number;
        }[];
      },
      { loading?: string; setLoading: (loading: string) => void }
    >,
  ) {
    let loading = "";
    function setLoading(newLoading: string) {
      loading = newLoading;
      handle.context.set({
        loading: newLoading,
        setLoading,
      });
      handle.update();
    }
    handle.context.set({
      setLoading,
    });

    // Hide the loader when navigating back
    if (typeof window !== "undefined") {
      window.addEventListener("pageshow", () => {
        setLoading("");
      });
    }

    return () => (
      <>
        <form
          method="POST"
          action={routes.auth.atmosphere.login.href()}
          mix={css({ display: "flex", flexDirection: "column", gap: "0.75rem" })}
        >
          {handle.props.savedHandles.map((s) => (
            <button
              key={s.handle}
              type="submit"
              name="handle"
              value={s.handle}
              mix={[
                button(),
                buttonStyles,
                css({
                  "--color": "0.5104 0.1 350",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  textAlign: "left",
                  justifyContent: "start",
                  gap: "0.5rem",
                  height: "44px",
                  paddingInline: "0.5rem",
                }),
                on("click", () => {
                  setLoading(s.handle);
                  handle.update();
                }),
              ]}
              disabled={!!loading && loading !== s.handle}
            >
              <FallbackImage src={s.avatar} /> <span>{s.handle}</span>{" "}
              <div mix={css({ flexGrow: 1 })} />{" "}
              {loading === s.handle ? <Loader /> : <ChevronRight />}
            </button>
          ))}
        </form>
        {handle.props.savedHandles.length > 0 ? (
          <hr
            mix={css({
              border: "solid 1px oklch(0.5104 0.1 350 / 0.5)",
              borderRadius: "50%",
              marginBlock: "1.5rem",
            })}
          />
        ) : null}
        <div mix={css({ display: "flex", flexDirection: "column", gap: "0.5rem" })}>
          <LoginCombobox />
          <CreateAccountButton />
        </div>
      </>
    );
  },
);

function LoginCombobox(handle: Handle) {
  let options: { label: string; imageUrl?: string; searchValue: string[]; value: string }[] = [];
  let inputNode: Element;
  let abortController = new AbortController();
  let [debouncedTypeahead] = debounce(async (value: string) => {
    abortController = new AbortController();
    const url = new URL(ATPROTO_TYPEAHEAD_ENDPOINT);
    url.searchParams.append("q", value);
    fetch(url, {
      signal: AbortSignal.any([abortController.signal, handle.signal]),
      headers: { "X-Client": "thoriumsim.com" },
    })
      .then((res) => res.json())
      .then((data) => {
        options = (data.actors ?? []).map(
          (actor: { did: string; handle: string; displayName?: string; avatar?: string }) => ({
            value: actor.handle,
            label: actor.displayName ?? actor.handle,
            imageUrl: actor.avatar ?? null,
            searchValue: [actor.handle, actor.displayName, actor.did].filter(Boolean),
          }),
        );
        handle.update();
        if (options.length > 0) {
          handle.queueTask(() => {
            inputNode.dispatchEvent(new OpenComboboxEvent());
          });
        }
      })
      .catch(() => {});
  }, 150);
  return () => (
    <form
      method="POST"
      action={routes.auth.atmosphere.login.href()}
      rmx-document
      mix={[
        combobox.onComboboxChange((event) => {
          handle.context.get(LoginComboboxProvider).setLoading("login");

          event.currentTarget.submit();
        }),
        on("input", (event) => {
          abortController.abort("cancelled");
          if (!(event.target instanceof HTMLInputElement)) return;
          const value = event.target.value;
          if (!value) {
            options = [];
            handle.update();
            return;
          }
          debouncedTypeahead(value);
        }),
      ]}
    >
      <combobox.Context name="handle">
        <input
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          mix={[
            input({ size: "lg" }),
            inputStyle,

            combobox.input(),
            createMixin<HTMLInputElement>((handle) => {
              handle.queueTask((node) => {
                inputNode = node;
              });
              return () => [
                // @ts-expect-error
                on(OpenComboboxEvent.name, () => {
                  handle.context.get(combobox.Context).openFromInputActivation();
                }),
              ];
            })(),
          ]}
          placeholder="your.handle.com"
          name="handle-input"
        />
        <div
          mix={[
            combobox.popover(),
            modalBackground,
            css({
              borderRadius: "0.5rem",
              padding: "0.5rem",
            }),
          ]}
        >
          <div
            mix={[
              combobox.list(),
              css({ display: "flex", flexDirection: "column", gap: "0.5rem" }),
            ]}
          >
            {options.map((option) => (
              <div
                key={option.value}
                mix={[
                  combobox.option(option),
                  css({
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.25rem",
                    borderRadius: "0.25rem",
                    border: "solid 1px transparent",
                    '&[data-highlighted="true"]': {
                      border: "solid 1px rgb(255 255 255 / 0.5)",
                      background: "oklch(0.2584 0.1716 311 / 0.8)",
                    },
                  }),
                ]}
              >
                <FallbackImage src={option.imageUrl} /> {option.label}
              </div>
            ))}
          </div>
        </div>
        <input mix={combobox.hiddenInput()} />
      </combobox.Context>
      <LoginButton />
    </form>
  );
}

function LoginButton(handle: Handle) {
  return () => {
    return (
      <button
        type="submit"
        mix={[
          button(),
          buttonStyles,
          css({ "--color": "0.5104 0.1 350", width: "100%", display: "flex", marginTop: "0.5rem" }),
        ]}
        disabled={!!handle.context.get(LoginComboboxProvider).loading}
      >
        {handle.context.get(LoginComboboxProvider).loading === "login" ? <Loader /> : "Log in"}
      </button>
    );
  };
}

function CreateAccountButton(handle: Handle) {
  return () => {
    return (
      <>
        <style>
          {`@starting-style {
  dialog:open {
    opacity: 0;
    transform: scale(0.9);
  }
  dialog:open::backdrop {
    background-color: transparent;
  }
}`}
        </style>
        <dialog
          id="create-account"
          mix={[
            css({
              maxWidth: "24rem",
              width: "100%",
              textAlign: "left",
              position: "relative",
              opacity: 0,
              transform: "scale(0.9)",
              transition: "all 0.2s allow-discrete",
              "&:open": {
                opacity: 1,
                transform: "scale(1)",
                "&::backdrop": {
                  backgroundColor: "rgb(0 0 0 / 0.8)",
                },
              },
              "&::backdrop": {
                backgroundColor: "transparent",
                transition: "all 0.2s allow-discrete",
              },
            }),
            modalBackground,
          ]}
        >
          <h2>Are you sure?</h2>
          <p>
            You can use any Atmosphere account, including accounts from Bluesky, Tangled, Semble,
            and all the{" "}
            <a href="https://atstore.fyi/" target="_blank" rel="noopener noreferrer">
              other apps.
            </a>
          </p>
          <div mix={css({ display: "flex", gap: "0.5rem", justifyContent: "end" })}>
            <button
              mix={[button(), buttonStyles, css({ "--color": "0.6104 0.1 350" })]}
              command="close"
              commandFor="create-account"
            >
              Cancel
            </button>
            <form
              action={routes.auth.atmosphere.createAccount.href()}
              method="POST"
              mix={on("submit", () => {
                handle.context.get(LoginComboboxProvider).setLoading("create");
              })}
            >
              <button
                mix={[
                  button(),
                  buttonStyles,
                  css({
                    "--color": "0.6104 0.2 350",
                    display: "flex",
                    width: "17ch",
                    boxSizing: "border-box",
                  }),
                ]}
                type="submit"
                disabled={!!handle.context.get(LoginComboboxProvider).loading}
              >
                {handle.context.get(LoginComboboxProvider).loading === "create" ? (
                  <Loader />
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          </div>
          <button
            command="close"
            commandFor="create-account"
            mix={css({
              background: "transparent",
              border: "none",
              position: "absolute",
              top: "0.5rem",
              right: "0.5rem",
              color: "white",
              width: "2.75rem",
              height: "2.75rem",
              borderRadius: "8px",
              display: "grid",
              placeItems: "center",
              "&:hover": {
                background: "oklch(0.2 0.1716 311)",
              },
            })}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
            <span
              mix={css({
                position: "absolute",
                left: "-500px",
                top: "-500px",
                opacity: 0,
                pointerEvents: "none",
              })}
            >
              Close
            </span>
          </button>
        </dialog>
        <button
          command="show-modal"
          commandFor="create-account"
          disabled={!!handle.context.get(LoginComboboxProvider).loading}
          mix={[
            button(),
            buttonStyles,
            css({ "--color": "0.5104 0.1 350", width: "100%", display: "flex" }),
          ]}
        >
          {handle.context.get(LoginComboboxProvider).loading === "create" ? (
            <Loader />
          ) : (
            "Create Account"
          )}
        </button>
      </>
    );
  };
}
