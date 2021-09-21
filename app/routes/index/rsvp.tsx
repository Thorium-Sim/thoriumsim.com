import {FaCalendar, FaCalendarAlt, FaSpinner} from "react-icons/fa";
import {
  ActionFunction,
  Form,
  LinksFunction,
  LoaderFunction,
  redirect,
  usePendingFormSubmit,
  useRouteData,
} from "remix";
import {parseBody} from "remix-utils";
import {commitSession, getSession} from "~/auth/localSession.server";
import {seoMeta} from "~/components/seoMeta";
import Stars, {styles} from "~/components/Stars";
import {db} from "~/helpers/prisma.server";
import sendSubscribeEmail from "~/helpers/sendSubscribeEmail";

export let links: LinksFunction = () => {
  return [{rel: "stylesheet", href: styles}];
};

export let meta = seoMeta({title: "RSVP - Thorium Nova"});

export let action: ActionFunction = async ({request}) => {
  const body = await parseBody(request);
  const email = body.get("email") || "";
  const newsletter = body.get("newsletter");
  let session = await getSession(request.headers.get("Cookie") || "");
  if (!email) {
    session.flash("error", "Email is a required field.");
    return redirect("/rsvp", {
      headers: {"set-cookie": await commitSession(session)},
    });
  }
  try {
    const existingSub = await db.subscriber.findUnique({where: {email}});
    if (!existingSub) {
      await db.subscriber.create({
        data: {
          email,
          status: newsletter === "on" ? "pending" : "inactive",
          SubscriberTagLookup: {
            create: {
              SubscriberTag: {
                connectOrCreate: {
                  where: {tag: "open_source_rsvp"},
                  create: {tag: "open_source_rsvp"},
                },
              },
            },
          },
        },
      });
      if (newsletter === "on") {
        await sendSubscribeEmail(email);
      }
    } else {
      await db.subscriberTagLookup.create({
        data: {
          Subscriber: {connect: {subscriber_id: existingSub.subscriber_id}},
          SubscriberTag: {
            connectOrCreate: {
              where: {tag: "open_source_rsvp"},
              create: {tag: "open_source_rsvp"},
            },
          },
        },
      });
    }
    return redirect(`/rsvp?email=${email}`, {
      headers: {"set-cookie": await commitSession(session)},
    });
  } catch (err) {
    if (err instanceof Error) {
      session.flash("error", err.message);
    }
    return redirect(`/rsvp`, {
      headers: {"set-cookie": await commitSession(session)},
    });
  }
};

export let loader: LoaderFunction = async ({request, params, context}) => {
  const {searchParams} = new URL(request.url);
  const email = searchParams.get("email");

  if (email) {
    return {subscribed: true};
  }
  return {};
};
export default function RSVP() {
  const {subscribed} = useRouteData();
  const pendingForm = usePendingFormSubmit();
  return (
    <Stars>
      <div className="flex flex-col items-center gap-8">
        {subscribed ? (
          <>
            <h1 className="text-6xl text-center font-extrabold">You're in!</h1>
            <p className="text-lg max-w-screen-md text-center">
              Thanks for signing up! The Thorium Nova Open Source meeting will
              be held October 5th at 7:30pm ET.
            </p>
            <div className="flex gap-4 flex-wrap justify-center items-center">
              <a
                className="thorium-button block"
                href="http://www.google.com/calendar/event?action=TEMPLATE&dates=20211005T233000Z%2F20211005T243000Z&text=Thorium%20Nova%20Open%20Source&location=https%3A%2F%2Fmeet.around.co%2Fr%2Fthorium-nova&details=Thorium%20Nova%20is%20going%20open%20source!%20This%20virtual%20meeting%20will%20be%20all%20about%20what%20that%20means%20and%20how%20you%20can%20contribute%20to%20make%20the%20best%20spaceship%20bridge%20simulator%20controls%20ever.%0A%0A"
                target="_blank"
              >
                Add to Google Calendar <FaCalendar />
              </a>
              <a
                className="thorium-button block"
                href="https://files.thoriumsim.com/file/thorium-public/storage/Thorium+Nova+Open+Source.ics"
                download
              >
                Download .ics <FaCalendarAlt />
              </a>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-6xl text-center font-extrabold">
              Enter your email to RSVP
            </h1>
            <p>
              The Thorium Nova Open Source meeting will be held October 5th at
              7:30pm ET.
            </p>
            <Form method="post">
              <div className="flex flex-wrap sm:flex-nowrap mb-8">
                <div className="flex-[2] mb-2 sm:mb-0 sm:mr-4">
                  <input
                    name="email"
                    placeholder="Your email address"
                    required
                    type="email"
                    disabled={!!pendingForm}
                    className="bg-white bg-opacity-10 text-base p-3 border border-coolGray-500 w-full h-full min-w-[200px] transition-all duration-200 text-white focus:outline-none focus:ring ring-thorium-400"
                  />
                </div>
                <button
                  className="thorium-button"
                  data-element="submit"
                  disabled={!!pendingForm}
                >
                  {pendingForm ? (
                    <FaSpinner className="animate-spinner" />
                  ) : (
                    "RSVP"
                  )}
                </button>
              </div>
              <label>
                <input
                  type="checkbox"
                  defaultChecked={true}
                  name="newsletter"
                />{" "}
                <span>Also subscribe me to the Thorium Email Newsletter</span>
              </label>
            </Form>
          </>
        )}
      </div>
    </Stars>
  );
}
