import { Post, User } from "@prisma/client";

export default function BlogPost({
  post,
}: {
  post: Omit<Post, "newsletterDate" | "newsletterSent"> & {
    User: Pick<User, "profilePictureUrl" | "displayName">;
  };
}) {
  return (
    <>
      <h1 className="text-center text-2xl font-extrabold sm:text-5xl">
        {post.title}
      </h1>
      <div className="mx-auto my-8 flex items-center justify-center gap-4 text-sm sm:text-base">
        {post.User.profilePictureUrl && (
          <img
            className="h-8 w-8 rounded-full"
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
      {post.featuredImageUrl && post.featuredImageUrl !== "null" && (
        <img
          className="my-12 mx-auto w-full shadow-xl sm:my-24 sm:w-3/4 sm:rounded-lg"
          src={post.featuredImageUrl}
          alt={post.title}
        />
      )}
      <div
        className="prose mx-auto mb-16 max-w-prose px-4"
        dangerouslySetInnerHTML={{ __html: post.body || "" }}
      ></div>
    </>
  );
}
