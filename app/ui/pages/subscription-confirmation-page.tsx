import { css } from "remix/ui";
import { Document } from "../document.tsx";
import Header from "../Header.tsx";
import { Stars } from "../Stars.tsx";

export function SubscriptionConfirmationPage() {
  return () => (
    <Document>
      <Header />
      <div mix={css({ position: "absolute", top: 0, left: 0, zIndex: -1 })}>
        <Stars>
          <h1 mix={css({ fontSize: "3rem" })}>You're in!</h1>
          <p mix={css({ fontSize: "1.5rem" })}>
            Thanks for confirming your subscription. See you on Thorium Thursday!
          </p>
        </Stars>
      </div>
    </Document>
  );
}
export function SubscriptionConfirmationFailedPage() {
  return () => (
    <Document>
      <Header />
      <div mix={css({ position: "absolute", top: 0, left: 0, zIndex: -1 })}>
        <Stars>
          <h1 mix={css({ fontSize: "3rem" })}>Something went wrong!</h1>
          <p mix={css({ fontSize: "1.5rem" })}>
            There was a problem confirming your subscription. Reply to the subscription confirmation
            email to get some help subscribing.
          </p>
        </Stars>
      </div>
    </Document>
  );
}
