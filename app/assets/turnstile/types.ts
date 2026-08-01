import type { Props } from "remix/ui";
import * as Turnstile from "./turnstile.ts";

declare global {
  // Note the capital "W"
  interface Window {
    turnstile: Turnstile.Turnstile;
  }
}

/** Render options or parameters for the `<Turnstile />` component. */
export interface ComponentRenderOptions extends Pick<
  Turnstile.RenderParameters,
  "action" | "cData" | "theme" | "retry" | "language" | "execution" | "appearance"
> {
  /**
   * The tabindex of Turnstile’s iframe for accessibility purposes.
   * @default 0
   */
  tabIndex?: Turnstile.RenderParameters["tabindex"];

  /**
   * Whether to add or not a hidden response input element with the turnstile token.
   * @default true
   */
  responseField?: Turnstile.RenderParameters["response-field"];

  /**
   * The name of the hidden input element added to the container where Turnstile is injected.
   * @default "cf-turnstile-response"
   */
  responseFieldName?: Turnstile.RenderParameters["response-field-name"];

  /**
   * Duration in milliseconds before the widget automatically retries.
   * @default 8000
   */
  retryInterval?: Turnstile.RenderParameters["retry-interval"];

  /**
   * The size of the Turnstile widget.
   * Accepted values: "normal", "compact", "flexible", "invisible".
   * Normal: 300x65px, compact: 150x140px, flexible: 100% width (min: 300px) x 65px.
   * Invisible will show no widget and is only to be used with invisible type widgets.
   * Note: the values officially accepted by Turnstile are "normal", "flexible" and "compact"; "invisible" is a
   * library-only convention (it is not forwarded to Turnstile).
   * @default "normal"
   */
  size?: Turnstile.WidgetSize;

  /**
   * The refresh mode to use when the given Turnstile token expires.
   * The default is "auto". "never" will never refresh the widget, "manual" will prompt the user with a refresh button.
   * @default "auto"
   */
  refreshExpired?: Turnstile.RenderParameters["refresh-expired"];

  /**
   * The refresh mode to use when the widget times out.
   * The default is "auto". "never" will never refresh the widget, "manual" will prompt the user with a refresh button.
   * @default "auto"
   */
  refreshTimeout?: Turnstile.RenderParameters["refresh-timeout"];

  /**
   * Allows Cloudflare to gather visitor feedback upon widget failure.
   * @default true
   */
  feedbackEnabled?: Turnstile.RenderParameters["feedback-enabled"];

  /**
   * Controls whether an unbranded (Offlabel, Enterprise only) widget displays the privacy link.
   * See {@link https://developers.cloudflare.com/turnstile/additional-configuration/offlabel/ the Offlabel docs} for more info.
   * @default true
   */
  offlabelShowPrivacy?: Turnstile.RenderParameters["offlabel-show-privacy"];

  /**
   * Controls whether an unbranded (Offlabel, Enterprise only) widget displays the help link.
   * See {@link https://developers.cloudflare.com/turnstile/additional-configuration/offlabel/ the Offlabel docs} for more info.
   * @default true
   */
  offlabelShowHelp?: Turnstile.RenderParameters["offlabel-show-help"];
}

/** Custom options for the injected script. */
export interface ScriptOptions {
  /**
   * Custom nonce for the injected script.
   * @default undefined
   */
  nonce?: string;

  /**
   * Define if set the injected script as defer.
   * @default true
   */
  defer?: boolean;

  /**
   * Define if set the injected script as async.
   * @default true
   */
  async?: boolean;

  /**
   * Custom ID of the injected script.
   * @default "cf-turnstile-script"
   */
  id?: string;

  /**
   * Custom name of the onload callback.
   * @default "onloadTurnstileCallback"
   */
  onLoadCallbackName?: string;

  /** Callback invoked when script fails to load (e.g. Cloudflare has an outage). */
  onError?: () => void;

  /**
   * Custom crossOrigin for the injected script.
   * @default undefined
   */
  crossOrigin?: Props<"script">["crossOrigin"];
}

/** `<Turnstile />` component props */
export interface TurnstileProps extends Omit<Props<"div">, "onError"> {
  /** Your Cloudflare Turnstile sitekey. This sitekey is associated with the corresponding widget configuration and is created upon the widget creation. */
  siteKey: Turnstile.RenderParameters["sitekey"];

  /**
   * Callback that is invoked upon success of the challenge.
   * The callback is passed a token that can be validated.
   */
  onSuccess?: Turnstile.RenderParameters["callback"];

  /** Callback that is invoked when a challenge expires. */
  onExpire?: Turnstile.RenderParameters["expired-callback"];

  /**
   * Callback invoked when there is an error (e.g. network error or the challenge failed). The callback is passed an error code.
   *
   * Common error code families: `110xxx` (invalid or unauthorized sitekey/domain), `110600` (challenge timed out),
   * `110620` (interaction timed out), `200100` (visitor clock skew or cached page), `200500` (challenge iframe could not load),
   * `300xxx` and `600xxx` (generic challenge failures), `400xxx` (sitekey validation issues).
   *
   * Refer to [Client-side error codes](https://developers.cloudflare.com/turnstile/troubleshooting/client-side-errors/error-codes/) for the full list.
   */
  onError?: Turnstile.RenderParameters["error-callback"];

  /** Callback that is invoked before the user is prompted for interactivity. */
  onBeforeInteractive?: Turnstile.RenderParameters["before-interactive-callback"];

  /** Callback that is invoked when the interactive challenge has been solved. */
  onAfterInteractive?: Turnstile.RenderParameters["after-interactive-callback"];

  /** Callback that is invoked when the browser is not supported by Turnstile. */
  onUnsupported?: Turnstile.RenderParameters["unsupported-callback"];

  /** Callback that is invoked when the Turnstile widget times out. */
  onTimeout?: Turnstile.RenderParameters["timeout-callback"];

  /**
   * Custom widget render options. See {@link https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/#configurations the docs} for more info.
   */
  options?: ComponentRenderOptions;

  /**
   * Custom injected script options.
   */
  scriptOptions?: ScriptOptions;

  /** Callback that is invoked when the script is loaded. */
  onLoadScript?: () => void;
}
