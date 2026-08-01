import { css, type Handle } from "remix/ui";
import { Document } from "../document.tsx";
import { LoginComboboxProvider } from "../../assets/login-combobox.tsx";
import type { SavedHandle } from "../../actions/authController.tsx";

export function LoginPage(handle: Handle<{ savedHandles: SavedHandle[] }>) {
  return () => (
    <Document>
      <div
        mix={css({
          display: "grid",
          placeItems: "center",
          textAlign: "center",
          minHeight: "100vh",
        })}
      >
        <div>
          <h1>Thorium Nova</h1>
          <p mix={css({ color: "rgb(220, 220, 220)", marginTop: 0 })}>
            Sign in with your{" "}
            <a href="https://atmosphereaccount.com" target="_blank" rel="noopener noreferrer">
              Atmosphere account
            </a>
            .
          </p>

          <LoginComboboxProvider savedHandles={handle.props.savedHandles} />
        </div>
      </div>
    </Document>
  );
}
