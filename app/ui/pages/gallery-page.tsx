import { css, type Handle, type RemixNode } from "remix/ui";
import { Document } from "../document.tsx";
import Header from "../Header.tsx";
import { routes } from "../../routes.ts";
import { SeoMeta } from "../../utils/seoMeta.tsx";

const images = [
  {
    url: "https://assets.thoriumsim.com/gallery/main.avif",
    caption: "The main screen of Thorium Nova, where you'll start your flight.",
  },
  {
    url: "https://assets.thoriumsim.com/gallery/cargo.avif",
    caption: "Deck maps allow for transferring cargo with automated cargo containers.",
  },
  {
    url: "https://assets.thoriumsim.com/gallery/navigation.avif",
    caption: "The navigation screen lets the crew set course and see the ship's position.",
  },
  {
    url: "https://assets.thoriumsim.com/gallery/pilot.avif",
    caption: "The pilots screen for setting course and activating engines.",
  },
  {
    url: "https://assets.thoriumsim.com/gallery/theme.avif",
    caption: "The crew's layout can be customized using CSS.",
  },
  {
    url: "https://assets.thoriumsim.com/gallery/universe.avif",
    caption: "The universe is fully customizable to add new ship classes, solar systems, and more.",
  },
  {
    url: "https://assets.thoriumsim.com/gallery/voyager.avif",
    caption:
      "The USS Voyager simulator set which was open from 1990 - 2012 and serves as the inspiration for Thorium Nova.",
  },
  {
    url: "https://assets.thoriumsim.com/gallery/voyager2.avif",
    caption: "The USS Voyager II simulator set which opened in 2015.",
  },
];

export function GalleryPage(handle: Handle<{ children?: RemixNode }>) {
  return () => (
    <Document
      head={
        <SeoMeta
          title="Gallery - Thorium Nova"
          description="Check out some screenshots from the bridge simulator game."
          path={routes.gallery.href()}
        />
      }
    >
      <Header />
      <div
        mix={css({
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "clamp(1rem, 2.5vw, 2rem)",
          maxWidth: "960px",
          width: "100%",
          marginInline: "auto",
          marginBlock: "2rem",
        })}
      >
        {images.map((i) => (
          <a
            mix={css({ display: "block" })}
            href={routes.galleryImage.href({ image: i.url.split("/").at(-1)! })}
            rmx-document
          >
            <figure mix={css({ margin: "0px", width: "100%" })}>
              <img
                src={i.url}
                mix={css({
                  cursor: "pointer",
                  width: "100%",
                  aspectRatio: "16/9",
                  viewTransitionName: i.url.split("/").at(-1)?.split(".").join(""),
                  objectFit: "cover",
                })}
                alt={i.caption}
              />
              <figcaption>{i.caption}</figcaption>
            </figure>
          </a>
        ))}
      </div>
      {handle.props.children}
    </Document>
  );
}

export function GalleryImage(handle: Handle<{ image: string }>) {
  const img = images.find((i) => i.url.endsWith(handle.props.image));
  return () => (
    <Document
      head={
        <SeoMeta
          title="Gallery - Thorium Nova"
          description={img?.caption}
          path={routes.galleryImage.href({ image: handle.props.image })}
        />
      }
    >
      <a
        class="gallery-image"
        mix={[
          css({
            cursor: "pointer",
            display: "block",
            background: "rgb(0 0 0 / 0.8)",
            position: "fixed",
            inset: "0px",
          }),
        ]}
        href={routes.gallery.href()}
        rmx-document
      >
        <img
          src={`https://assets.thoriumsim.com/gallery/${handle.props.image}`}
          mix={css({
            maxWidth: "100%",
            width: "100%",
            padding: "2%",
            viewTransitionName: handle.props.image.split(".").join(""),
          })}
          alt={img?.caption}
        />
      </a>
    </Document>
  );
}
