import { css } from "remix/ui";
import Header from "../Header.tsx";
import { Document } from "../document.tsx";
import { Stars } from "../Stars.tsx";

export function UnsubscribeConfirmationPage() {
  return () => (
    <Document>
      <Header />
      <div mix={css({ position: "absolute", top: 0, left: 0, zIndex: -1 })}>
        <Stars>
          <h1 mix={css({ fontSize: "3rem" })}>You're unsubscribed!</h1>
          <p mix={css({ fontSize: "1.5rem" })}>Sorry to see you go. Good luck out there!</p>
        </Stars>
      </div>
    </Document>
  );
}
