import { on, ref, type Handle } from "remix/ui";
import type { ScriptOptions, TurnstileProps } from "./types.ts";

const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js";
const DEFAULT_SCRIPT_ID = "cf-turnstile-script";
const DEFAULT_ONLOAD_NAME = "onloadTurnstileCallback";

class TurnstileLoaded extends Event {
  static name = "turnstile-loaded";
  constructor() {
    super(TurnstileLoaded.name);
  }
}
export function Turnstile(handle: Handle<TurnstileProps>) {
  return () => {
    const {
      scriptOptions,
      options = {},
      siteKey,
      onSuccess,
      onExpire,
      onError,
      onBeforeInteractive,
      onAfterInteractive,
      onUnsupported,
      onTimeout,
      onLoadScript,
      ...divProps
    } = handle.props;

    const widgetContainer = <div id="turnstile-widget">&nbsp;</div>;
    return (
      <div
        {...divProps}
        mix={[
          // @ts-expect-error
          on(TurnstileLoaded.name, () => {
            onLoadScript?.();
            window.turnstile.render("#turnstile-widget", {
              sitekey: siteKey,
              size: "flexible",
              execution: "render",
              "unsupported-callback": onUnsupported,
              "after-interactive-callback": onAfterInteractive,
              "before-interactive-callback": onBeforeInteractive,
              "error-callback": onError,
              "expired-callback": onExpire,
              "timeout-callback": onTimeout,
              callback: onSuccess,
              ...options,
            });
          }),
          divProps.mix,
        ]}
      >
        {widgetContainer}
        <TurnstileScript {...scriptOptions} />
      </div>
    );
  };
}

function TurnstileScript(handle: Handle<ScriptOptions>) {
  const {
    onLoadCallbackName = DEFAULT_ONLOAD_NAME,
    id = DEFAULT_SCRIPT_ID,
    async = true,
    defer = true,
    crossOrigin,
    nonce,
    onError,
  } = handle.props;
  let scriptNode: HTMLScriptElement | null = null;
  if (typeof window !== "undefined") {
    // @ts-expect-error
    window[onLoadCallbackName] = () => {
      scriptNode?.parentNode?.dispatchEvent(new TurnstileLoaded());
      // @ts-expect-error
      delete window[onLoadCallbackName];
    };

    return () => (
      <script
        src={`${SCRIPT_URL}?onload=${onLoadCallbackName}&render=explicit`}
        id={id}
        defer={defer}
        async={async}
        nonce={nonce}
        crossOrigin={crossOrigin}
        mix={[
          onError ? on("error", onError) : undefined,
          ref((node) => {
            scriptNode = node;
          }),
        ]}
      />
    );
  }

  // Return blank on the server
  return () => null;
}
