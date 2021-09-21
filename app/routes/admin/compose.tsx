import {LinksFunction} from "@remix-run/react/routeModules";
import {
  DetailedHTMLProps,
  FormEvent,
  InputHTMLAttributes,
  useRef,
  useState,
} from "react";
import Header from "~/components/Header";
import MarkdownInput, {styles} from "~/components/MarkdownInput";
import {Markdown as Markdown} from "~/helpers/processMarkdown";
import {
  ActionFunction,
  Form,
  LoaderFunction,
  redirect,
  usePendingFormSubmit,
  useRouteData,
} from "remix";
import dateStyle from "react-date-range/dist/styles.css"; // main style file
import dateTheme from "react-date-range/dist/theme/default.css"; // theme css file
import customTheme from "~/styles/datePicker.css";
import {Calendar} from "react-date-range";
import {Popover} from "@headlessui/react";
import {getUploadUrl} from "~/helpers/b2";
import {saveImageHandler} from "~/helpers/saveImageHandler";
import {UploadData} from "~/helpers/types";
import {Input} from "~/components/Input";
import {parseBody} from "remix-utils";
import {db} from "~/helpers/prisma.server";
import {Post, User} from "@prisma/client";
import {authenticator} from "~/auth/auth.server";
import {getSession} from "~/auth/localSession.server";
import BlogPost from "~/components/BlogPost";

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: styles,
  },
  {
    rel: "stylesheet",
    href: dateStyle,
  },
  {
    rel: "stylesheet",
    href: dateTheme,
  },
  {
    rel: "stylesheet",
    href: customTheme,
  },
];

interface ComposeData {
  uploadData: UploadData;
}
export const loader: LoaderFunction = async () => {
  const uploadData = await getUploadUrl();
  return {uploadData};
};

export const action: ActionFunction = async ({request}) => {
  const session = await getSession(request.headers.get("Cookie") || "");
  const userData = session.get(authenticator.sessionKey) as User;
  if (!userData) throw new Error("Must be logged in to post.");

  let body = await parseBody(request);
  const publishDate = body.get("publishDate");
  const slug = body.get("slug");
  if (!slug) throw {type: "slug", message: "Slug is a required parameter."};
  const title = body.get("title");
  if (!title) throw {type: "title", message: "Title is a required parameter."};
  const postData: Omit<Post, "post_id"> = {
    body: body.get("body"),
    excerpt: body.get("excerpt"),
    featuredImageUrl: body.get("featuredImageUrl"),
    publishDate: publishDate ? new Date(Number(publishDate)) : new Date(),
    published: body.get("published") === "on",
    slug,
    title,
    user_id: userData.user_id,
  };
  await db.post.upsert({
    create: postData,
    update: postData,
    where: {post_id: Number(body.get("id"))},
  });
  return redirect("/blog/compose");
};

const Checkbox = ({
  className,
  ...props
}: DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>) => {
  return <input className={`${className} `} type="checkbox" {...props} />;
};

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/(\w)\'(\w)/g, "$1$2") // replace apostrophes
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[\s\W-]+/g, "-")
    .replace(/-$/, "");
}
export default function Compose() {
  const {uploadData} = useRouteData<ComposeData>();
  const [body, setBody] = useState(``);
  const [title, setTitle] = useState(``);
  const [slug, setSlug] = useState(``);
  const [slugFocused, setSlugFocused] = useState(false);
  const [excerpt, setExcerpt] = useState(``);
  const [formPending, setFormPending] = useState(false);
  const pendingForm = usePendingFormSubmit();
  const [fileImage, setFileImage] = useState("");
  const [date, setDate] = useState(new Date());
  const [errors, setErrors] = useState<
    Partial<
      Record<
        | "title"
        | "slug"
        | "publishDate"
        | "featuredImage"
        | "published"
        | "excerpt"
        | "body",
        string
      >
    >
  >({});
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <h1 className="text-4xl font-extrabold mb-8">Compose Blog Post</h1>
      <div className="flex gap-4">
        <Form
          method="post"
          className="flex-1 flex flex-col gap-4"
          onSubmit={async (e: FormEvent) => {
            e.preventDefault();
            setFormPending(true);
            // Validate the form real quick
            if (!title.trim().length) {
              setErrors(e => ({...e, title: "Title must not be blank"}));
              setFormPending(false);
              return;
            }
            if (!body.trim().length) {
              setErrors(e => ({...e, body: "Body must not be blank"}));
              setFormPending(false);
              return;
            }

            const target = e.target as HTMLFormElement & {
              file: HTMLInputElement;
            };
            const image = fileRef.current?.files?.[0];

            if (image) {
              const result = await fetch(uploadData.uploadUrl, {
                method: "POST",
                body: image,
                headers: {
                  Authorization: uploadData.authorizationToken,
                  "Content-Type": "b2/x-auto",
                  "X-Bz-File-Name": `blog-images/${
                    slug || ""
                  }/${image.name.replace(/\s/gm, "-")}`,
                  "X-Bz-Content-Sha1": "do_not_verify",
                },
              }).then(res => res.json());
              const {fileName} = result;
              const url = `https://files.thoriumsim.com/file/thorium-public/${fileName}`;
              target.featuredImageUrl.value = url;
              if (fileRef.current) fileRef.current.value = "";
            }

            target.submit();
            setFormPending(true);
          }}
        >
          <input type="hidden" name="id" />
          <Input
            label="Title"
            name="title"
            value={title}
            onChange={e => setTitle(e.currentTarget.value)}
            error={errors.title}
          />

          <Input
            label="Slug"
            name="slug"
            value={slug || (slugFocused ? slug : slugify(title))}
            onChange={e => setSlug(e.currentTarget.value)}
            onFocus={() => setSlugFocused(true)}
            onBlur={() => setSlugFocused(false)}
          />
          <Input label="Publish Date">
            <Popover className="relative">
              <Popover.Button
                className={`text-left w-full h-8 rounded bg-tgray-500 p-2 focus:outline-none focus:ring ring-thorium-400 ${
                  errors.publishDate ? "border-red-500" : ""
                }`}
              >
                {date.toLocaleDateString()}
              </Popover.Button>

              <Popover.Panel className="absolute z-10">
                {({close}) => (
                  <Calendar
                    date={date}
                    onChange={newDate => {
                      setDate(newDate);
                      close();
                    }}
                    // @ts-expect-error
                    color="var(--calendar-selected, red)"
                  />
                )}
              </Popover.Panel>
            </Popover>
            <input name="publishDate" value={Number(date)} type="hidden" />
          </Input>
          <label className="flex flex-col cursor-pointer">
            Featured Image
            <div className="bg-tgray-700 w-full h-48 rounded flex justify-center items-center">
              {fileImage ? (
                <img
                  draggable={false}
                  src={fileImage || ""}
                  className="rounded w-full h-full object-contain"
                />
              ) : (
                <span className="text-white text-4xl font-bold">
                  Click to add a featured image
                </span>
              )}
            </div>
            <input
              type="file"
              hidden
              ref={fileRef}
              onChange={event => {
                const fileReader = new FileReader();
                fileReader.onload = () => {
                  if (typeof fileReader.result === "string") {
                    setFileImage(fileReader.result);
                  }
                };
                if (event.currentTarget.files?.[0]) {
                  fileReader.readAsDataURL(event.currentTarget.files[0]);
                }
              }}
            />
            <input type="hidden" name="featuredImageUrl" />
          </label>
          <label className="flex flex-col">
            Published
            <Checkbox type="checkbox" name="published" />
          </label>

          <Input
            label={`Excerpt (${excerpt.length} / 160)`}
            type="text"
            name="excerpt"
            maxLength={160}
            value={excerpt}
            onChange={e => setExcerpt(e.currentTarget.value)}
          />
          <label className="flex flex-col">
            Body
            <MarkdownInput
              value={body}
              setValue={setBody}
              name="body"
              saveImage={saveImageHandler(uploadData, `blog-images/${slug}`)}
            />
            <p className="text-red-500 text-xs italic">
              {errors.body ? errors.body : null}
            </p>
          </label>
          <button className="thorium-button justify-self-end self-end">
            Submit
          </button>
        </Form>
        <div className="flex-1 prose preview-window">
          <BlogPost
            post={{
              User: {profilePictureUrl: "", displayName: "The Author"},
              excerpt,
              publishDate: date,
              body,
              featuredImageUrl: fileImage,
              post_id: 0,
              published: true,
              slug,
              title,
              user_id: 0,
            }}
          />
        </div>
      </div>
    </div>
  );
}
