import { css } from "remix/ui";

export const buttonStyles = css({
  "--color": "0.6104 0.2244 250.93",
  padding: "1rem 2rem",
  fontSize: "0.85rem",
  background: "oklch(var(--color) / 0.1)",
  borderRadius: "0.25rem",
  transition: "all 0.2s ease",
  border: "solid 1px oklch(var(--color))",
  textShadow: "none",
  color: "white",
  boxShadow: "none",
  "&:hover": {
    background: "oklch(var(--color) / 0.3)",
  },
  "&:focus-within": {
    boxShadow: "0rem 0rem 0.5rem oklch(from oklch(var(--color)) calc(l + 0.3) c h)",
  },
  "&:active": {
    background: "oklch(from oklch(var(--color)) calc(l / 2) c h / 0.1)",
  },
});
