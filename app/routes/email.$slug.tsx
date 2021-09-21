import {Post, User} from "@prisma/client";
import {Link} from "react-router-dom";
import {LoaderFunction, useRouteData} from "remix";
import {json} from "remix-utils";
import getEmailContent from "~/components/EmailTemplate";
import ErrorPage from "~/components/Errors";
import {db} from "~/helpers/prisma.server";

export const loader: LoaderFunction = async ({params}) => {
  const {slug} = params;
  const post = await db.post.findUnique({
    where: {slug},
  });
  if (!post) return json({notFound: true}, {status: 404});

  return {
    ...post,
    body: await getEmailContent(post?.body || "", "", post.post_id),
  };
};

export default function PostPage() {
  const post = useRouteData<(Post & {User: User}) | {notFound: true}>();
  if ("notFound" in post) {
    return (
      <ErrorPage
        title="404"
        text={
          <Link to="/" className="text-thorium-300 hover:text-thorium-400 mt-8">
            Return Home
          </Link>
        }
      />
    );
  }

  return <div dangerouslySetInnerHTML={{__html: post.body || ""}} />;
}
