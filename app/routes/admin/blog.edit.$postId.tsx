import {Post} from "@prisma/client";
import {
  ActionFunction,
  LinksFunction,
  LoaderFunction,
  redirect,
  useLoaderData,
} from "remix";
import {json, parseBody} from "remix-utils";
import {authenticator} from "~/auth/auth.server";
import {commitSession, getSession} from "~/auth/localSession.server";
import Compose, {
  datePickerStyles,
  markdownStyles,
} from "~/components/BlogComposer";
import {getUploadUrl} from "~/helpers/b2";
import {db} from "~/helpers/prisma.server";
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

export const loader: LoaderFunction = async ({params}) => {
  const {postId} = params;
  const post = await db.post.findUnique({
    where: {post_id: Number(postId)},
    include: {
      User: {select: {displayName: true, profilePictureUrl: true}},
      PostSubscriberTag: {
        select: {SubscriberTag: {select: {tag: true, subscriberTag_id: true}}},
      },
    },
  });
  if (!post) return json({notFound: true}, {status: 404});
  const uploadData = await getUploadUrl();
  const subscriberTags = await db.subscriberTag.findMany();

  return {
    post: {
      ...post,
      subscriberTags: post.PostSubscriberTag.map(s => s.SubscriberTag).filter(
        Boolean
      ),
    },
    uploadData,
    subscriberTags,
  };
};

export const action: ActionFunction = async ({request}) => {
  const body = await parseBody(request.clone());
  const session = await getSession(request.headers.get("Cookie") || "");
  const userData = session.get(authenticator.sessionKey);

  if (request.method === "DELETE") {
    await db.post.delete({where: {post_id: Number(body.get("post_id"))}});
    session.flash("toast", "Post deleted!");
  } else {
    const publishDate = Number(body.get("publishDate"));
    const newsletterDate = Number(body.get("newsletterDate"));
    const slug = body.get("slug");
    if (!slug) throw {type: "slug", message: "Slug is a required parameter."};
    const title = body.get("title");
    if (!title)
      throw {type: "title", message: "Title is a required parameter."};

    const postData: Pick<
      Post,
      "body" | "publishDate" | "published" | "slug" | "title" | "user_id"
    > &
      Partial<Pick<Post, "newsletterDate" | "excerpt" | "featuredImageUrl">> = {
      body: body.get("body"),
      excerpt: body.get("excerpt"),
      ...{featuredImageUrl: body.get("featuredImageUrl") || undefined},
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
        data: body.getAll("subscriberTag[]").map(subscriber_tag_id => ({
          subscriber_tag_id: Number(subscriber_tag_id),
        })),
      },
    };
    const post = await db.post.upsert({
      create: {...postData, PostSubscriberTag: subscriberTagUpdate},
      update: {
        ...postData,
        PostSubscriberTag: {
          deleteMany: {},
          ...subscriberTagUpdate,
        },
      },
      where: {post_id: Number(body.get("post_id"))},
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
  const {post} = useLoaderData();
  return <Compose post={post} />;
}
