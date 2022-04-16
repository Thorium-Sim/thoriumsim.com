import { Post } from "@prisma/client";
import { useLoaderData } from "@remix-run/react";
import {
  ActionFunction,
  LinksFunction,
  LoaderFunction,
  redirect,
} from "@remix-run/server-runtime";
import { json } from "remix-utils";
import Compose, {
  datePickerStyles,
  markdownStyles,
} from "~/components/BlogComposer";
import { getUploadUrl } from "~/helpers/b2";
import { db } from "~/helpers/prisma.server";
import { commitSession, getSession, getUser } from "~/session.server";
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

export const loader: LoaderFunction = async ({ params }) => {
  const { postId } = params;
  const post = await db.post.findUnique({
    where: { post_id: Number(postId) },
    include: {
      User: { select: { displayName: true, profilePictureUrl: true } },
      PostSubscriberTag: {
        select: {
          SubscriberTag: { select: { tag: true, subscriberTag_id: true } },
        },
      },
    },
  });
  if (!post) return json({ notFound: true }, { status: 404 });
  const uploadData = await getUploadUrl();
  const subscriberTags = await db.subscriberTag.findMany();

  return {
    post: {
      ...post,
      subscriberTags: post.PostSubscriberTag.map((s) => s.SubscriberTag).filter(
        Boolean
      ),
    },
    uploadData,
    subscriberTags,
  };
};

export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();
  const session = await getSession(request);
  const userData = await getUser(request);

  if (!userData?.roles?.includes("admin") || !userData.user_id)
    throw new Error("Unauthorized");
  if (request.method === "DELETE") {
    await db.post.delete({ where: { post_id: Number(body.get("post_id")) } });
    session.flash("toast", "Post deleted!");
  } else {
    const publishDate = Number(body.get("publishDate"));
    const newsletterDate = Number(body.get("newsletterDate"));
    const slug = String(body.get("slug"));
    if (!slug) throw { type: "slug", message: "Slug is a required parameter." };
    const title = String(body.get("title"));
    if (!title)
      throw { type: "title", message: "Title is a required parameter." };

    const postData: Pick<
      Post,
      "body" | "publishDate" | "published" | "slug" | "title" | "user_id"
    > &
      Partial<Pick<Post, "newsletterDate" | "excerpt" | "featuredImageUrl">> = {
      body: String(body.get("body")),
      excerpt: String(body.get("excerpt")),
      ...{
        featuredImageUrl: String(body.get("featuredImageUrl")) || undefined,
      },
      publishDate: publishDate ? new Date(publishDate) : new Date(),
      newsletterDate: newsletterDate ? new Date(newsletterDate) : null,
      published: body.get("published") === "on",
      slug,
      title,
      user_id: userData.user_id,
    };

    const subscriberTagUpdate = {
      createMany: {
        skipDuplicates: true,
        data: body.getAll("subscriberTag[]").map((subscriber_tag_id) => ({
          subscriber_tag_id: Number(subscriber_tag_id),
        })),
      },
    };
    const post = await db.post.upsert({
      create: { ...postData, PostSubscriberTag: subscriberTagUpdate },
      update: {
        ...postData,
        PostSubscriberTag: {
          deleteMany: {},
          ...subscriberTagUpdate,
        },
      },
      where: { post_id: Number(body.get("post_id")) },
      include: {
        PostSubscriberTag: true,
      },
    });
    session.flash("toast", "Post updated!");
  }
  return redirect("/admin/blog", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export default function PostEdit() {
  const { post } = useLoaderData();
  return <Compose post={post} />;
}
