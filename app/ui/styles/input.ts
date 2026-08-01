import { css } from "remix/ui";

export const inputStyle = css({
  background: "oklch(0.0584 0.1716 311)",
  color: "white",
  border: "solid 1px oklch(0.2584 0.1716 311)",
  textShadow: "none",
  fontSize: "0.85rem",
  height: "44px",
  "&:focus-within": {
    boxShadow: `
rgba(0, 0, 0, 0.04) 0px 2px 3px -1px, 
rgba(0, 0, 0, 0.04) 0px 3px 4px -1.5px,
rgba(0, 0, 0, 0.04) 0px 4px 5px -2px,
oklch(0.2584 0.1716 330) 0px 0px 0px 1px,
oklch(0.2584 0.1716 330 / 0.1) 0px 0px 0px 4px,
oklch(0.2584 0.1716 330 / 0.08) 0px 6px 32px 4px,
oklch(0.2584 0.1716 330 / 0.05) 0px 0px 8px 1px inset`,
  },
});
