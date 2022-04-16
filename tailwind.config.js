const defaultTheme = require("tailwindcss/defaultTheme");
const {
  orange,
  amber,
  lime,
  emerald,
  cyan,
  sky,
  violet,
  fuchsia,
  rose,
  stone,
  gray,
  slate,
} = require("tailwindcss/colors");

module.exports = {
  mode: "jit",

  purge: ["./app/**/*.{js,ts,tsx,md,mdx}", "./remix.config.js"],
  theme: {
    extend: {
      animation: {
        spinner: "spin 1s steps(8) infinite",
      },
      typography: {
        DEFAULT: {
          css: {
            color: "#ddd",
            h1: {
              fontFamily: '"Exo 2", Georgia, serif',
              fontSize: "3rem",
              lineHeight: 1.666,
              margin: "25px auto 18px",
              color: "white",
              textAlign: "center",
              fontWeight: "900",
            },
            h2: {
              fontFamily: '"Exo 2", Georgia, serif',
              margin: "25px auto 18px",
              fontSize: "2rem",
              lineHeight: 1.333,
              color: "#eee",
              fontWeight: "900",
            },
            h3: {
              fontFamily: '"Exo 2", Georgia, serif',
              margin: "25px auto 18px",
              color: "#eee",
              fontWeight: "900",
              fontSize: "1.5rem",
              lineHeight: 1.333,
            },
            h4: {
              fontFamily: '"Exo 2", Georgia, serif',
              color: "#eee",
              fontWeight: "900",
              fontSize: "1.25rem",
              lineHeight: 1.333,
            },
            h5: {
              fontFamily: '"Exo 2", Georgia, serif',
              color: "#eee",
              fontWeight: "900",
            },
            h6: {
              fontFamily: '"Exo 2", Georgia, serif',
              color: "#eee",
              fontWeight: "900",
            },
            p: {
              lineHeight: 1.756,
              fontSize: "18px",
              margin: "0 auto 35px",
            },
            ul: {
              listStyle: "none",
              fontSize: "18px",
            },
            ol: {
              listStyle: "none",
              fontSize: "18px",
            },
            li: {
              // paddingBottom: "15px",
              listStyle: "none",
            },
            strong: {
              color: "white",
            },
            blockquote: {
              color: "#adbbd9",
              borderLeftColor: "##818b9e",
            },
            code: {
              color: "#ccc",
              "background-color": "#282c35",
              padding: "0.125rem",
              "border-radius": "0.25rem",
            },
            th: {
              color: "white",
            },
            img: {
              borderRadius: "1rem",
              marginRight: "auto",
              marginLeft: "auto",
            },
            figure: {
              borderRadius: "1rem",
              figcaption: {
                textAlign: "center",
                margin: "1rem 0",
                color: "#eee",
              },
            },
            hr: {
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='15' viewBox='0 0 10 15' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0.567383' y='14.1777' width='16' height='1' transform='rotate(-60 0.567383 14.1777)' fill='%232D2E33'/%3E%3C/svg%3E")`,
              position: `relative`,
              margin: "50px auto",
              border: 0,
              height: "1rem",
              backgroundRepeat: "repeat-x",
              boxSizing: "border-box",
              backgroundPosition: "center",
            },
            a: {
              color: "#c5adf9",
              "&:hover": {
                color: "#a054fa",
              },
            },
          },
        },
      },
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        orange,
        amber,
        lime,
        emerald,
        cyan,
        sky,
        violet,
        fuchsia,
        rose,
        stone,
        gray,
        slate,
        tgray: {
          DEFAULT: "#291F37",
          50: "#6B518F",
          100: "#634B85",
          200: "#554072",
          300: "#46355E",
          400: "#382A4B",
          500: "#291F37",
          600: "#1F182A",
          700: "#16101D",
          800: "#0C0910",
          900: "#020203",
        },
        brand: "#F94CC3",
        thorium: {
          50: "#f4f5fb",
          100: "#ebe9fb",
          200: "#d8ccfa",
          300: "#c5adf9",
          400: "#b380fa",
          500: "#a054fa",
          600: "#8636f7",
          700: "#682ce7",
          800: "#5125c2",
          900: "#4800af",
        },
        cerise: {
          50: "#fcf9f9",
          100: "#fdedf5",
          200: "#fbcbed",
          300: "#faa0df",
          400: "#f94cc3",
          500: "#fc3cac",
          600: "#f72386",
          700: "#dd1b68",
          800: "#b0174c",
          900: "#8c143b",
        },
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ["disabled"],
      textColor: ["disabled"],
      cursor: ["disabled"],
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
