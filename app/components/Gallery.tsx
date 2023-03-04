import cargo from "../images/index/screenshots/cargo.jpeg";
import main from "../images/index/screenshots/main.jpeg";
import navigation from "../images/index/screenshots/navigation.jpeg";
import pilot from "../images/index/screenshots/pilot.jpeg";
import theme from "../images/index/screenshots/theme.jpeg";
import universe from "../images/index/screenshots/universe.jpeg";

export default function Gallery() {
  return (
    <div className="full-width relative grid grid-cols-1 gap-4 px-8 sm:grid-cols-2 md:px-16 lg:grid-cols-3">
      <GalleryImage
        src={main}
        alt="The main screen of Thorium Nova, where you'll start your flight."
      />
      <GalleryImage
        src={pilot}
        alt="The pilots screen for setting course and activating engines."
      />
      <GalleryImage
        src={cargo}
        alt="Deck maps allow for transferring cargo with automated cargo containers."
      />
      <GalleryImage
        src={navigation}
        alt="The navigation screen lets the crew set course and see the ship's position."
      />
      <GalleryImage
        src={theme}
        alt="The crew's layout can be customized using CSS."
      />
      <GalleryImage
        src={universe}
        alt="The universe is fully customizable to add new ship classes, solar systems, and more."
      />
    </div>
  );
}

function GalleryImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-video h-full w-full">
      <a href={src} target="_blank" rel="noreferrer">
        <figure className="my-0">
          <img src={src} className="my-0 cursor-pointer" alt={alt} />
          <figcaption>{alt}</figcaption>
        </figure>
      </a>
    </div>
  );
}
