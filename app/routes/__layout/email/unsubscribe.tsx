import {LinksFunction, LoaderFunction, redirect} from "remix";
import {seoMeta} from "~/components/seoMeta";
import Stars, {styles} from "~/components/Stars";
import {db} from "~/helpers/prisma.server";

export let links: LinksFunction = () => {
  return [{rel: "stylesheet", href: styles}];
};

export let meta = seoMeta({title: "Confirm Subscription - Thorium Nova"});

export let loader: LoaderFunction = async ({request}) => {
  const {searchParams} = new URL(request.url);
  const email = searchParams.get("email");

  if (email) {
    await db.subscriber.update({
      where: {email},
      data: {status: "unsubscribed"},
    });
    return redirect("/email/unsubscribe");
  }
  return {};
};
export default function ConfirmSubscription() {
  return (
    <Stars>
      <div className="flex flex-col items-center gap-8">
        <h1 className="text-6xl text-center font-extrabold">
          You're unsubscribed!
        </h1>
        <p className="text-lg max-w-screen-md text-center">
          Sorry to see you go. Good luck out there!
        </p>
      </div>
    </Stars>
  );
}
