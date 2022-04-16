import {
  LinksFunction,
  LoaderFunction,
  redirect,
} from "@remix-run/server-runtime";
import { seoMeta } from "~/components/seoMeta";
import Stars, { styles } from "~/components/Stars";
import { db } from "~/helpers/prisma.server";

export let links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export let meta = seoMeta({ title: "Confirm Subscription - Thorium Nova" });

export let loader: LoaderFunction = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (email) {
    await db.subscriber.update({
      where: { email },
      data: { status: "active" },
    });
    return redirect("/email/confirmSubscription");
  }
  return {};
};
export default function ConfirmSubscription() {
  return (
    <Stars>
      <div className="flex flex-col items-center gap-8">
        <h1 className="text-center text-6xl font-extrabold">You're in!</h1>
        <p className="max-w-screen-md text-center text-lg">
          Thanks for confirming your subscription. See you on Thorium Thursday!
        </p>
      </div>
    </Stars>
  );
}
