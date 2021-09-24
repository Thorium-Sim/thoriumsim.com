import {LinksFunction} from "@remix-run/react/routeModules";
import {ActionFunction, LoaderFunction, redirect} from "remix";
import {getUploadUrl} from "~/helpers/b2";

import {parseBody} from "remix-utils";
import {db} from "~/helpers/prisma.server";
import {Post, User} from "@prisma/client";
import {authenticator} from "~/auth/auth.server";
import {getSession} from "~/auth/localSession.server";
import Compose, {
  datePickerStyles,
  markdownStyles,
} from "~/components/BlogComposer";
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

export const loader: LoaderFunction = async () => {
  const uploadData = await getUploadUrl();
  const subscriberTags = await db.subscriberTag.findMany();
  return {uploadData, subscriberTags};
};

export const action: ActionFunction = async ({request}) => {
  const session = await getSession(request.headers.get("Cookie") || "");
  const userData = session.get(authenticator.sessionKey) as User;
  if (!userData) throw new Error("Must be logged in to post.");

  let body = await parseBody(request);
  const publishDate = body.get("publishDate");
  const newsletterDate = Number(body.get("newsletterDate"));
  const slug = body.get("slug");
  if (!slug) throw {type: "slug", message: "Slug is a required parameter."};
  const title = body.get("title");
  if (!title) throw {type: "title", message: "Title is a required parameter."};
  const postData: Omit<Post, "post_id"> = {
    body: body.get("body"),
    excerpt: body.get("excerpt"),
    featuredImageUrl: body.get("featuredImageUrl"),
    publishDate: publishDate ? new Date(Number(publishDate)) : new Date(),
    newsletterDate: newsletterDate ? new Date(newsletterDate) : null,
    newsletterSent: false,
    published: body.get("published") === "on",
    slug,
    title,
    user_id: userData.user_id,
  };
  const subscriberTagUpdate = {
    createMany: {
      skipDuplicates: true,
      data: body
        .getAll("subscriberTag[]")
        .map(subscriber_tag_id => ({
          subscriber_tag_id: Number(subscriber_tag_id),
        })),
    },
  };
  const post = await db.post.upsert({
    create: {...postData, PostSubscriberTag: subscriberTagUpdate},
    update: {...postData, PostSubscriberTag: subscriberTagUpdate},
    where: {post_id: Number(body.get("post_id"))},
  });
  return redirect(`/admin/blog/edit/${post.post_id}`);
};

export default function NewPost() {
  return <Compose />;
}
