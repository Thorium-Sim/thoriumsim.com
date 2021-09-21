import {LoaderFunction, redirect} from "remix";
import {db} from "~/helpers/prisma.server";

export let loader: LoaderFunction = async ({request}) => {
  const {searchParams} = new URL(request.url);
  const email = searchParams.get("email");
  const broadcastId = searchParams.get("broadcastId");
  if (email && broadcastId) {
    const existingOpen = await db.subscriberEmailOpen.findFirst({
      where: {Subscriber: {email}, broadcast_id: Number(broadcastId)},
    });
    if (!existingOpen) {
      await db.subscriberEmailOpen.create({
        data: {
          broadcast_id: Number(broadcastId),
          Subscriber: {connect: {email}},
        },
      });
    }
  }
  return redirect(
    "https://files.thoriumsim.com/file/thorium-public/storage/pixel.png"
  );
};
export default function TrackingPixel() {
  return null;
}
