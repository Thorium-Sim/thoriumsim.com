import Meteors, {styles} from "~/components/Meteors";
import Stars, {styles as starsStyles} from "~/components/Stars";
import mainStyles from "~/styles/mainPage.css";
import logo from "~/images/Triquetra.svg";
import {FaDiscord, FaGithub} from "react-icons/fa";
import Newsletter from "~/components/Newsletter";
import {
  ActionFunction,
  HeadersFunction,
  LinksFunction,
  LoaderFunction,
  redirect,
} from "remix";
import MainContent from "../../components/MainContent.mdx";
import {commitSession, getSession} from "~/auth/localSession.server";
import {json} from "remix-utils";
import {db} from "~/helpers/prisma.server";
import sendSubscribeEmail from "~/helpers/sendSubscribeEmail";
export let links: LinksFunction = () => {
  return [
    {rel: "stylesheet", href: styles},
    {rel: "stylesheet", href: mainStyles},
    {rel: "stylesheet", href: starsStyles},
  ];
};

export let action: ActionFunction = async ({request}) => {
  const body = new URLSearchParams(await request.text());
  const email = body.get("email_address");
  let session = await getSession(request.headers.get("Cookie") || "");
  if (!email) {
    session.flash("error", "Invalid email address.");
  } else {
    try {
      await db.subscriber.create({
        data: {
          email,
          status: "pending",
        },
      });
      await sendSubscribeEmail(email);
      session.flash("newsletter-signup", true);
    } catch (err) {
      if (err instanceof Error) {
        session.flash("error", err.message);
      }
    }
  }
  return redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export let headers: HeadersFunction = () => {
  const allDay = 3600 * 24;
  return {
    "cache-control": `max-age=3600 s-maxage=${allDay}`,
  };
};

export let loader: LoaderFunction = async ({request}) => {
  let session = await getSession(request.headers.get("Cookie") || "");
  const data = {newsletterSignup: session.get("newsletter-signup")};
  return json(data, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export default function LayoutRoute() {
  return (
    <div>
      <div className="hero h-screen absolute w-full pointer-events-none">
        <Meteors />
        <div className="h-4/5 stars-wrapper absolute w-full">
          <Stars />
        </div>
        <div className="planet-bg w-full h-screen absolute bottom-0 pointer-events-none overflow-hidden z-[-3]" />
        <div className="w-full h-screen absolute bottom-0 pointer-events-none overflow-hidden z-[-2]">
          <div className="absolute left-[-50%] top-[75%] planet rounded-[50%]  w-[200vw] h-[200vw] bg-transparent"></div>
        </div>
      </div>
      <div className=" mt-32 w-full flex flex-col justify-center items-center z-10 text-center gap-8">
        <img src={logo} className="z-10 max-w-[50%] sm:max-w-xs"></img>
        <h1 className="font-extrabold m-0 text-6xl z-10">Thorium Nova</h1>
        <h2 className="font-extrabold m-0 text-4xl z-10">
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
      <div className="w-full px-8 prose max-w-prose lg:prose-lg mx-auto">
        <MainContent />
      </div>
    </div>
  );
}
