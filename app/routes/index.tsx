import Meteors, { styles } from "~/components/Meteors";
import Stars, { styles as starsStyles } from "~/components/Stars";
import mainStyles from "~/styles/mainPage.css";
import logo from "~/images/Triquetra.svg";
import { FaDiscord, FaGithub } from "react-icons/fa";
import Newsletter from "~/components/Newsletter";
import MainContent from "~/components/MainContent.mdx";
import { json } from "remix-utils";
import {
  HeadersFunction,
  LinksFunction,
  LoaderFunction,
} from "@remix-run/server-runtime";
import { commitSession, getSession } from "~/session.server";

export let links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: mainStyles },
    { rel: "stylesheet", href: starsStyles },
  ];
};

export let headers: HeadersFunction = () => {
  const allDay = 3600 * 24;
  return {
    "cache-control": `max-age=3600 s-maxage=${allDay}`,
  };
};

export let loader: LoaderFunction = async ({ request }) => {
  let session = await getSession(request);
  const data = { newsletterSignup: session.get("newsletter-signup") };
  return json(data, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export default function LayoutRoute() {
  return (
    <div>
      <div className="hero pointer-events-none absolute h-screen w-full">
        <Meteors />
        <div className="stars-wrapper absolute h-4/5 w-full">
          <Stars />
        </div>
        <div className="planet-bg pointer-events-none absolute bottom-0 z-[-3] h-screen w-full overflow-hidden" />
        <div className="pointer-events-none absolute bottom-0 z-[-2] h-screen w-full overflow-hidden">
          <div className="planet absolute left-[-50%] top-[75%] h-[200vw]  w-[200vw] rounded-[50%] bg-transparent"></div>
        </div>
      </div>
      <div className=" z-10 mt-32 flex w-full flex-col items-center justify-center gap-8 text-center">
        <img src={logo} className="z-10 max-w-[50%] sm:max-w-xs"></img>
        <h1 className="z-10 m-0 text-6xl font-extrabold">Thorium Nova</h1>
        <h2 className="z-10 m-0 text-4xl font-extrabold">
          The Future of Bridge Simulation
        </h2>
        <div className="z-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="https://github.com/thorium-sim/thorium-nova"
            target="_blank"
            rel="noopener noreferrer"
            className="thorium-button"
          >
            Contribute <FaGithub size="2em" />
          </a>
          <a
            href="https://discord.gg/BxwXaUB"
            target="_blank"
            rel="noopener noreferrer"
            className="thorium-button"
          >
            Join Us On Discord <FaDiscord size="2em" />
          </a>
        </div>
      </div>
      <div className="h-24"></div>
      <Newsletter />
      <div className="h-24"></div>
      <div className="prose mx-auto w-full max-w-prose px-8 pb-24 lg:prose-lg">
        <MainContent />
      </div>
    </div>
  );
}
