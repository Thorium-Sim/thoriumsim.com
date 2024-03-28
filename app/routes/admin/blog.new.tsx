import { LinksFunction } from "@remix-run/react/routeModules";
import { getUploadUrl } from "~/helpers/b2";

import { db } from "~/helpers/prisma.server";
import { Post, User } from "@prisma/client";
import Compose, {
  datePickerStyles,
  markdownStyles,
} from "~/components/BlogComposer";
import {
  ActionFunction,
  LoaderFunction,
  redirect,
} from "@remix-run/server-runtime";
import { getUser } from "~/session.server";
export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: markdownStyles,
  },
  {
    rel: "stylesheet",
    href: datePickerStyles,
  },
];

export const handle = {
  noLayout: true,
};

export const loader: LoaderFunction = async () => {
  const uploadData = await getUploadUrl();
  const subscriberTags = await db.subscriberTag.findMany();
  return { uploadData, subscriberTags };
};

export const action: ActionFunction = async ({ request }) => {
  const userData = await getUser(request);
  if (!userData?.user_id) throw new Error("Must be logged in to post.");

  let body = await request.formData();
  const publishDate = body.get("publishDate");
  const newsletterDate = Number(body.get("newsletterDate"));
  const slug = String(body.get("slug"));
  if (!slug) throw { type: "slug", message: "Slug is a required parameter." };
  const title = String(body.get("title"));
  if (!title)
    throw { type: "title", message: "Title is a required parameter." };
  const postData: Omit<Post, "post_id"> = {
    body: String(body.get("body")),
    excerpt: String(body.get("excerpt")),
    featuredImageUrl: String(body.get("featuredImageUrl")),
    publishDate: publishDate ? new Date(Number(publishDate)) : new Date(),
    newsletterDate: newsletterDate ? new Date(newsletterDate) : null,
    newsletterSent: false,
    published: body.get("published") === "on",
    slug,
    title,
    user_id: userData.user_id,
  };
  const subscriberTagUpdate = body
    .getAll("subscriberTag[]")
    .map((subscriber_tag_id) => Number(subscriber_tag_id));
  const [post] = await await db.$transaction([
    db.post.upsert({
      create: { ...postData },
      update: { ...postData },
      where: { post_id: Number(body.get("post_id")) },
    }),
    ...subscriberTagUpdate.map((subscriber_tag_id) =>
      db.postSubscriberTag.create({
        data: {
          post_id: Number(body.get("post_id")),
          subscriber_tag_id,
        },
      })
    ),
  ]);
  return redirect(`/admin/blog/edit/${post.post_id}`);
};

export default function NewPost() {
  return <Compose />;
}
