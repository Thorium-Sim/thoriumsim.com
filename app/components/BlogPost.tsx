import {Post, User} from "@prisma/client";

export default function BlogPost({
  post,
}: {
  post: Omit<Post, "newsletterDate" | "newsletterSent"> & {
    User: Pick<User, "profilePictureUrl" | "displayName">;
  };
}) {
  return (
    <>
      <h1 className="text-2xl sm:text-5xl font-extrabold text-center">
        {post.title}
      </h1>
      <div className="text-sm sm:text-base mx-auto flex items-center gap-4 my-8 justify-center">
        {post.User.profilePictureUrl && (
          <img
            className="w-8 h-8 rounded-full"
            src={post.User.profilePictureUrl}
            alt={post.User.displayName || "The Author"}
          />
        )}
        <span className="text-lg">
          <strong>{post.User.displayName}</strong>
          {post.publishDate
            ? `, ${new Date(post.publishDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}`
            : ""}
        </span>
      </div>
      {post.featuredImageUrl && (
        <img
          className="my-12 sm:my-24 w-full sm:w-3/4 mx-auto sm:rounded-lg shadow-xl"
          src={post.featuredImageUrl}
          alt={post.title}
        />
      )}
      <div
        className="prose max-w-prose mx-auto mb-16 px-4"
        dangerouslySetInnerHTML={{__html: post.body || ""}}
      ></div>
    </>
  );
}
