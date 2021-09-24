import {Post, SubscriberTag, Tag} from "@prisma/client";
import {
  DetailedHTMLProps,
  FormEvent,
  InputHTMLAttributes,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {Form, usePendingFormSubmit, useRouteData, useSubmit} from "remix";
import {UploadData} from "~/helpers/types";
import DatePicker from "react-datepicker";
export {default as datePickerStyles} from "react-datepicker/dist/react-datepicker.css";
import BlogPost from "~/components/BlogPost";
import {saveImageHandler} from "~/helpers/saveImageHandler";
import {Input} from "~/components/Input";
import MarkdownInput from "./MarkdownInput";
import {FaSpinner} from "react-icons/fa";
export {styles as markdownStyles} from "./MarkdownInput";
import useThrottleFn from "~/helpers/useThrottleFn";
import {processMarkdown} from "~/helpers/processMarkdown";
import TagSelect from "./TagSelect";
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
interface ComposeData {
  uploadData: UploadData;
  subscriberTags: SubscriberTag[];
}
export default function Compose({
  post,
}: {
  post?: Partial<Post & {subscriberTags: SubscriberTag[]}>;
}) {
  const {uploadData, subscriberTags: tags} = useRouteData<ComposeData>();
  const [body, setBody] = useState(post?.body || "");
  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [slugFocused, setSlugFocused] = useState(false);
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [formPending, setFormPending] = useState(false);
  const [subscriberTags, setSubscriberTags] = useState<SubscriberTag[]>(
    post?.subscriberTags || []
  );
  const pendingForm = usePendingFormSubmit();
  const [featuredImageUrl, setFeaturedImageUrl] = useState(
    post?.featuredImageUrl || ""
  );
  const [publishDate, setPublishDate] = useState(
    post?.publishDate ? new Date(post?.publishDate) : new Date()
  );
  const [newsletterDate, setNewsletterDate] = useState<Date | null>(
    post?.newsletterDate ? new Date(post?.newsletterDate) : null
  );
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
  useEffect(() => {
    if (!slugFocused) {
      setSlug(slug => slugify(slug));
    }
  }, [slugFocused]);
  const fileRef = useRef<HTMLInputElement>(null);
  const dpRef = useRef<DatePicker>(null);
  let submit = useSubmit();

  const bodyHtml = useThrottleFn(
    useCallback(async (body: string) => {
      const html = await processMarkdown(body);
      return html;
    }, []),
    50,
    [body]
  );
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
            setFormPending(false);
          }}
        >
          <input type="hidden" name="post_id" value={post?.post_id} />
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
            <DatePicker
              selected={publishDate}
              onChange={date => {
                if (date && !Array.isArray(date)) setPublishDate(date);
              }}
              showPopperArrow={false}
              peekNextMonth
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              showTimeInput
              customInput={
                <input
                  className={`my-2 shadow appearance-none border border-opacity-50 rounded w-full py-2 px-3 text-grey-200 bg-opacity-50 bg-black  focus:outline-none focus:ring ring-thorium-40`}
                  type="text"
                />
              }
              dateFormat="MMMM d, yyyy h:mm aa"
            />
            <input
              name="publishDate"
              value={Number(publishDate)}
              type="hidden"
            />
          </Input>
          <Input label="Newsletter Date">
            <DatePicker
              ref={dpRef}
              selected={newsletterDate}
              onChange={date => {
                if (!Array.isArray(date)) setNewsletterDate(date);
              }}
              showPopperArrow={false}
              peekNextMonth
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              showTimeInput
              customInput={
                <input
                  className={`my-2 shadow appearance-none border border-opacity-50 rounded w-full py-2 px-3 text-grey-200 bg-opacity-50 bg-black  focus:outline-none focus:ring ring-thorium-40`}
                  type="text"
                />
              }
              dateFormat="MMMM d, yyyy h:mm aa"
            >
              <button
                onClick={() => {
                  setNewsletterDate(null);

                  setTimeout(() => {
                    if (dpRef.current) {
                      dpRef.current.setOpen(false);
                    }
                  }, 50);
                }}
                type="button"
                className="block w-full py-2 bg-gray-200"
              >
                No Newsletter
              </button>
            </DatePicker>
            <input
              name="newsletterDate"
              value={Number(newsletterDate)}
              type="hidden"
            />
          </Input>
          <Input label="Send to tags">
            <TagSelect
              tags={tags}
              selected={subscriberTags}
              setSelected={setSubscriberTags}
            />
            {subscriberTags.map(tag => (
              <input
                key={tag.subscriberTag_id}
                type="hidden"
                name="subscriberTag[]"
                value={tag.subscriberTag_id}
              />
            ))}
          </Input>
          <label className="flex flex-col cursor-pointer">
            Featured Image
            <div className="bg-tgray-700 w-full h-48 rounded flex justify-center items-center">
              {featuredImageUrl ? (
                <img
                  draggable={false}
                  src={featuredImageUrl || ""}
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
                    setFeaturedImageUrl(fileReader.result);
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
            <Checkbox
              type="checkbox"
              name="published"
              defaultChecked={post?.published || false}
            />
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
              setValue={newBody => {
                setBody(newBody);
              }}
              name="body"
              saveImage={saveImageHandler(uploadData, `blog-images/${slug}`)}
            />
            <p className="text-red-500 text-xs italic">
              {errors.body ? errors.body : null}
            </p>
          </label>
          <div className="flex justify-end gap-4">
            {post?.post_id && (
              <button
                className="thorium-button !from-red-500 !to-rose-800"
                disabled={!!pendingForm || formPending}
                type="button"
                onClick={() =>
                  post.post_id &&
                  submit({post_id: post.post_id.toString()}, {method: "delete"})
                }
              >
                {pendingForm?.method === "DELETE" ? (
                  <FaSpinner className="animate-spinner" />
                ) : (
                  "Delete"
                )}
              </button>
            )}
            <button
              className="thorium-button"
              disabled={!!pendingForm || formPending}
            >
              {pendingForm?.method === "post" || formPending ? (
                <FaSpinner className="animate-spinner" />
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </Form>
        <div className="flex-1 prose preview-window">
          <BlogPost
            post={{
              User: {profilePictureUrl: "", displayName: "The Author"},
              excerpt,
              publishDate: publishDate,
              body: bodyHtml,
              featuredImageUrl: featuredImageUrl,
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
