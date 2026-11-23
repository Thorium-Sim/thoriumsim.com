import { css } from "remix/component";
import { Document } from "../document.tsx";
import Header from "../Header.tsx";
import { Stars } from "../Stars.tsx";
import { LottiePlayer } from "../../assets/lottie-player.tsx";
import animationData from "./astronaut.json" with { type: "json" };

export function NotFound() {
  return () => (
    <Document>
      <Header />
      <div mix={css({ position: "absolute", top: 0, left: 0, zIndex: -1 })}>
        <Stars />
      </div>
      <div mix={css({ marginInline: "auto", maxWidth: "32rem" })}>
        <LottiePlayer animationData={animationData} />
        <h1 mix={css({ textAlign: "center" })}>Uh Oh. We're a little lost.</h1>
        <h2 mix={css({ textAlign: "center" })}>
          <a href="/">Better head back home.</a>
        </h2>
      </div>
    </Document>
  );
}
