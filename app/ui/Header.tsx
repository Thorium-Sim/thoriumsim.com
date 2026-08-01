import { routes } from "../routes.ts";
import { Logo } from "./Logo.tsx";
import { css, Frame } from "remix/ui";

const linkStyle = css({
  fontWeight: 400,
  textDecoration: "none",
  transition: "color 0.3s ease",
});

export default function Header() {
  return () => (
    <div
      mix={css({
        display: "grid",
        boxSizing: "border-box",
        gridTemplateColumns: "auto 1fr auto",
        alignItems: "center",
        marginTop: "2rem",
        paddingInline: "1rem",
        width: "clamp(0px, 100vw, 960px)",
        marginInline: "auto",
        gap: "clamp(0.5rem,2.5vw,2rem)",
      })}
    >
      <a
        href={routes.home.href()}
        mix={css({
          pointer: "cursor",
          aspectRatio: "1",
          display: "flex",
          alignItems: "center",
          text: "white",
          textDecoration: "none",
          marginInlineEnd: "1rem",
          height: "2rem",
        })}
        rmx-document
        aria-label="Home"
      >
        <Logo color="currentcolor" height="100%" />
      </a>
      <div
        mix={css({
          display: "flex",
          alignItems: "end",
          flexWrap: "wrap",
          gap: "clamp(0.5rem,2.5vw,2rem)",
        })}
      >
        <a mix={[linkStyle]} href="/about" rmx-document>
          About
        </a>
        <a mix={linkStyle} href="/blog" rmx-document>
          Blog
        </a>
        <a mix={linkStyle} href={routes.gallery.href()} rmx-document>
          Gallery
        </a>
        <a mix={linkStyle} href="https://github.com/Thorium-Sim/thorium-nova/releases/latest">
          Download
        </a>
        <a
          mix={linkStyle}
          href={routes.blogPost.href({ slug: "contributing-to-thorium-nova" })}
          rmx-document
        >
          Contribute
        </a>
        <a mix={linkStyle} href="https://discord.gg/BxwXaUB">
          Discord
        </a>
      </div>
      <Frame src={routes.auth.userPopover.href()} />
    </div>
  );
}
