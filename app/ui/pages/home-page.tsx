import { css } from "remix/ui";

import { Document } from "../document.tsx";
import { Stars } from "../Stars.tsx";
import { Meteors } from "../Meteors.tsx";
import Header from "../Header.tsx";
import { Logo } from "../Logo.tsx";
import { button } from "remix/ui/button";
import { SeoMeta } from "../../utils/seoMeta.tsx";
import { routes } from "../../routes.ts";
import { buttonStyles } from "../styles/button.ts";
import {} from "../../assets/newsletter-signup.tsx";

export function HomePage() {
  return () => (
    <Document head={<SeoMeta path={routes.home.href()} />}>
      <Header />
      <div mix={css({ position: "absolute", top: 0, left: 0, zIndex: -1 })}>
        <Stars />
        <Meteors />
        <div
          mix={css({
            position: "absolute",
            top: "80vh",
            width: "100vw",
            height: "20vh",
            left: "0px",
            overflow: "hidden",
          })}
        >
          <div
            mix={css({
              borderRadius: "50%",
              aspectRatio: "1",
              width: "200vw",
              transform: "translate(-25%,0)",
              maskImage: "linear-gradient(rgba(0, 0, 0, 1), transparent 10%)",
              background: "oklch(0.2628 0.0456 302.55)",
              boxShadow: "inset 0px 10px 40px oklch(0.8661 0.0859 301.4111)",
            })}
          />
        </div>
      </div>
      <div
        mix={css({
          width: "100%",
          display: "flex",
          paddingInline: "0.5rem",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: "3rem",
          maxWidth: "960px",
          marginInline: "auto",
          flexGrow: "1",
          marginTop: "5rem",
          "@media(width <= 640px)": {
            marginTop: "2rem",
          },
        })}
      >
        <Logo mix={css({ maxWidth: "10rem", padding: "0 0rem" })} />
        <h1
          mix={css({
            fontSize: "4rem",
            marginBottom: "0.5rem",
            textAlign: "center",
            "@media(width <= 640px)": {
              fontSize: "3rem",
            },
          })}
        >
          Thorium Nova
        </h1>
        <h2
          mix={css({
            fontSize: "1.5rem",
            marginBottom: "0.5rem",
            fontWeight: 400,
            textTransform: "uppercase",
            color: "rgb(255 255 255 / 0.8)",
            textAlign: "center",
            "@media(width <= 640px)": {
              fontSize: "1rem",
            },
          })}
        >
          Starship Bridge Simulator
        </h2>

        <p
          mix={css({
            maxWidth: "40rem",
            textAlign: "center",
            textWrap: "balance",
            color: "rgb(255 255 255 / 0.8)",
            textShadow: "1px 1px 0px rgb(0 0 0 / 0.8)",
          })}
        >
          Assemble your crew. Take your station. Complete your mission. Each player controls
          different parts of the ship, working together to experience rich storylines and dynamic
          environments.
        </p>
        <a
          href="https://github.com/Thorium-Sim/thorium-nova/releases/latest"
          target="_blank"
          rel="noopener noreferrer"
          mix={[button({ tone: "primary" }), buttonStyles]}
        >
          Download
        </a>
      </div>
    </Document>
  );
}
