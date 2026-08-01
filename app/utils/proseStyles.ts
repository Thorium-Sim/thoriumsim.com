import { css } from "remix/ui";

export const proseStyles = css({
  fontSize: "1.125rem",
  lineHeight: 1.777778,
  color: "#eee",
  "& h1,h2,h3,h4,h5,h6": {
    margin: "25px auto 18px",
    "&:has(.icon.icon-link)": {
      position: "relative",
      "&:hover a": {
        display: "block",
      },
    },
  },
  "& ul, ol": {
    listStyle: "none",
    fontSize: "1.125rem",
  },
  "& ul": {
    "& > li": {
      position: "relative",
    },
  },
  "& ul > li::before": {
    content: '""',
    borderRadius: "50%",
    border: "solid 2px #c636bd",
    display: "inline-block",
    color: "#c636bd",
    height: "0.75rem",
    width: "0.75rem",
    aspect: 1,
    background: "transparent",
    position: "absolute",
    left: "-1.5rem",
    top: "0.625rem",
  },
  "& strong": {
    color: "white",
    "& a": {
      fontWeight: 600,
    },
  },
  "& blockquote": {
    color: "#adbbd9",
    borderLeftColor: "#818b9e",
  },
  "& figure": {
    borderRadius: "1rem",
    "& figcaption": {
      textAlign: "center",
      margin: "1rem 0",
      color: "#eee",
    },
  },
  "& hr": {
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='15' viewBox='0 0 10 15' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0.567383' y='14.1777' width='16' height='1' transform='rotate(-60 0.567383 14.1777)' fill='%232D2E33'/%3E%3C/svg%3E")`,
    position: `relative`,
    margin: "50px auto",
    border: 0,
    height: "1rem",
    backgroundRepeat: "repeat-x",
    boxSizing: "border-box",
    backgroundPosition: "center",
  },
  "& a": {
    color: "oklch(0.7954 0.1311 298.41)",
    "&:hover": {
      color: "oklch(0.619 0.2655 300.64)",
    },
  },
  "& img, & video": {
    maxWidth: "100%",
    height: "auto",
  },
  "& a:has(.icon)": {
    display: "none",
    width: "2rem",
    height: "1rem",
    position: "absolute",
    left: "-1.5rem",
    top: "0.25rem",
  },
  "& .icon.icon-link": {
    display: "block",
    background: `url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY2xhc3M9Imx1Y2lkZSBsdWNpZGUtbGluay1pY29uIGx1Y2lkZS1saW5rIj48cGF0aCBkPSJNMTAgMTNhNSA1IDAgMCAwIDcuNTQuNTRsMy0zYTUgNSAwIDAgMC03LjA3LTcuMDdsLTEuNzIgMS43MSIvPjxwYXRoIGQ9Ik0xNCAxMWE1IDUgMCAwIDAtNy41NC0uNTRsLTMgM2E1IDUgMCAwIDAgNy4wNyA3LjA3bDEuNzEtMS43MSIvPjwvc3ZnPg==)`,
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    height: "100%",
    width: "100%",
  },
});
